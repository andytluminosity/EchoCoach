import sys
from ast import Raise
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.

# Views are python functions which takes a web request and returns a web response (e.g html page)

# Viewsets are basiclaly 'classes' of views. AKA a group of views with common behvaiour.

from rest_framework.decorators import api_view, authentication_classes, permission_classes
from django.contrib.auth.models import Group, User
from django.contrib.auth import authenticate, login
from rest_framework import permissions, viewsets, authentication, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404
import torchvision.transforms.functional

from echocoach.myapp.serializers import UserSerializer

from django.http import HttpResponse

import torch
import torchvision
import os
import librosa
import torch
import torch.nn.functional as F
import tempfile
import subprocess

from .resemotenet import ResEmoteNet
from .affectnet import AffectNet
from .speech_emotion_cnn_model import CNNModel
from nitec import NITEC_Classifier, visualize
import pathlib
CWD = pathlib.Path.cwd()

speech_emotion_model_pipeline = CWD / "pytorch_folder" / "models" / 'cnn_speech_emotion_recognition_model.pth'

resemotenet = ResEmoteNet().to('cpu')
resemotenet.load_state_dict(torch.load(CWD / "pytorch_folder"  / "models" / 'best_resemotenet_model.pth', weights_only=False, map_location=torch.device('cpu')))
resemotenet.eval()

affectnet = AffectNet(3).to('cpu')
affectnet.load_state_dict(torch.load(CWD / "pytorch_folder"  / "models" / 'affectnet.pth', weights_only=False, map_location=torch.device('cpu')))
affectnet.eval()

nitec_pipeline = NITEC_Classifier(
    weights= CWD / "pytorch_folder" / "models" / 'nitec_rs18_e20.pth',
    device=torch.device('cpu') # or 'cpu'
)

test_transforms = torchvision.transforms.Compose([
    torchvision.transforms.Resize((224, 224)),
    torchvision.transforms.ToTensor(),
    torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@api_view(['POST'])
def analyze_facial(request):
    data = request.FILES['videoFile']

    # note you need ffmpeg installed! (brew install ffmpeg)
    # export DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib

    facial_expressions_scores = [0,0,0,0,0,0,0,0]
    totalscore = 0
    numscores = 0

    if sys.platform.startswith('win'):
        from deffcode import FFdecoder

        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_file:
            for chunk in data.chunks():
                tmp_file.write(chunk)
            tmp_file_path = tmp_file.name

        try:
            decoder = FFdecoder(tmp_file_path).formulate()
            with torch.no_grad():
                for frame in decoder.generateFrame():

                    # check if frame is None
                    if frame is None:
                        break

                    tensor = torch.from_numpy(frame)
                    tensor = torch.permute(tensor, (2, 0, 1))

                    #Transforms
                    crop = torchvision.transforms.CenterCrop(size=(96, 96))
                    resize = torchvision.transforms.Resize((96))

                    resemotenet = resize(tensor) # resize frame to fit model
                    resemotenet = crop(resemotenet)
                    resemotenet = torchvision.transforms.functional.convert_image_dtype(resemotenet, torch.float32) # convert datatype of tensor from uint8 to float32

                    resemotenet = resemotenet.unsqueeze(0) # unsqueeze is to produce fourth dimension in tensor, batch size
                    results = affectnet(resemotenet)
                    # print(results)
                    pred = results[0].argmax(0)
                    facial_expressions_scores[pred] += 1

                    #nitec (Eye contact)
                    results = nitec_pipeline.predict(frame).results
                    for result in results:
                        totalscore += result
                        numscores += 1              

            # terminate the decoder
            decoder.terminate()
        finally:
            os.unlink(tmp_file_path)
    else:
        import torchcodec
        decoder = torchcodec.decoders.VideoDecoder(data)
        with torch.no_grad():
            for frame in decoder:
                #Transforms
                crop = torchvision.transforms.CenterCrop(size=(96, 96))
                resize = torchvision.transforms.Resize((96))
                
                resemotenet = resize(frame) # resize frame to fit model
                resemotenet = crop(resemotenet)
                resemotenet = torchvision.transforms.functional.convert_image_dtype(resemotenet, torch.float32) # convert datatype of tensor from uint8 to float32
                resemotenet = resemotenet.unsqueeze(0) # unsqueeze is to produce fourth dimension in tensor, batch size
                results = affectnet(resemotenet)
                # print(results)
                pred = results[0].argmax(0)
                facial_expressions_scores[pred] += 1    

                #nitec (Eye contact)
                frame = torch.permute(frame, (1, 2, 0)) # permute torch tensor to be correct shape
                frame = frame.detach().cpu().numpy() # convert tensor into numpy array, which is what nitec accepts
                results = nitec_pipeline.predict(frame).results
                for result in results:
                    totalscore += result
                    numscores += 1
    
    if (numscores == 0):
        return Response([0, facial_expressions_scores])

    return Response([totalscore / numscores, facial_expressions_scores])

def extract_audio(file_path: str):
    try:
        subprocess.run(
            ['ffmpeg', '-i', file_path, '-ar', '22050', '-ac', '1', '-vn', 'extracted_audio.wav'],
            stdout=subprocess.DEVNULL,  # Hide normal output
            stderr=subprocess.PIPE,     # Capture error messages
            check=True
        )
    except subprocess.CalledProcessError as e:
        # Show the actual FFmpeg error message
        print("Audio extraction failed with error:")
        print(e.stderr.decode())  

        # Rethrow the error
        raise

# file_path is a pure audio file
def process_audio(file_path: str):
    y, sr = librosa.load(file_path, sr=22050)

    # Extract MFCCs
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=30, n_fft=2048, hop_length=512)
    mfccs = mfccs.flatten()  # shape: (n_mfcc * frames, )

    # Convert to tensor and reshape to (1, seq_len, 1) instead of (1, 1, seq_len)
    mfccs = torch.FloatTensor(mfccs).unsqueeze(0).unsqueeze(-1)  # (1, seq_len, 1)

    # Pad or truncate to match CNN input length
    input_length = 2376
    if mfccs.shape[1] > input_length:
        mfccs = mfccs[:, :input_length, :]
    else:
        mfccs = F.pad(mfccs, (0, 0, 0, input_length - mfccs.shape[1]))  # Pad along seq_len

    return mfccs  # (1, seq_len, 1)

@api_view(['POST'])
def analyze_voice(request):
    try:
        # Assumes the video file is a .webm
        video_file = request.FILES.get('videoFile')
        if not video_file:
            return Response({'error': 'No video file provided'}, status=400)

        # Save the uploaded file to a temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_file:
            for chunk in video_file.chunks():
                tmp_file.write(chunk)
            tmp_file_path = tmp_file.name

        try:
            extract_audio(tmp_file_path)

            # extracted_audio.wav is the created file
            features = process_audio('extracted_audio.wav')

            # Recreate the model
            model = CNNModel()  # same class as during training

            # Load state dict
            state_dict = torch.load(speech_emotion_model_pipeline, map_location='cpu')
            model.load_state_dict(state_dict)

            # Set to evaluation mode
            model.eval()

            with torch.no_grad():
                outputs = model(features)
                _, predicted = torch.max(outputs, 1)

            emotion_labels = ['neutral', 'happy', 'sad', 'angry', 'fear', 'disgust', 'surprise']
            predicted_emotion = emotion_labels[predicted.item()]

            # Calculate the confidence scores
            probabilities = F.softmax(outputs, dim=1)
            confidence_scores = {
                emotion: round(prob.item() * 100, 2)
                for emotion, prob in zip(emotion_labels, probabilities[0])
            }

            return Response({
                'emotion': predicted_emotion,
                'confidence_scores': confidence_scores
            })

        finally:
            os.unlink(tmp_file_path)
            os.unlink('extracted_audio.wav')

    except Exception as e:
        return Response({'error': str(e)}, status=500)