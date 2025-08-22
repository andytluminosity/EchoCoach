from django.shortcuts import render

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
import torchcodec
from nitec import NITEC_Classifier, visualize
from .fer2013 import Fer2013
from .resemotenet import ResEmoteNet
from .affectnet import NeuralNetwork
import cv2
import pathlib
CWD = pathlib.Path.cwd()

nitec_pipeline = NITEC_Classifier(
    weights= CWD / "pytorch_folder" / "nitec" / "models" / 'nitec_rs18_e20.pth',
    device=torch.device('cpu') # or 'cpu'
)

fer2013 = Fer2013(1).to('cpu')
fer2013.load_state_dict(torch.load(CWD / "pytorch_folder"  / "models" / 'fer2013.pth', weights_only=False, map_location=torch.device('cpu')))
fer2013.eval()

resemotenet = ResEmoteNet().to('cpu')
resemotenet.load_state_dict(torch.load(CWD / "pytorch_folder"  / "models" / 'best_resemotenet_model.pth', weights_only=False, map_location=torch.device('cpu')))
resemotenet.eval()

affectnet = NeuralNetwork(3).to('cpu')
affectnet.load_state_dict(torch.load(CWD / "pytorch_folder"  / "models" / 'affectnet.pth', weights_only=False, map_location=torch.device('cpu')))
affectnet.eval()

test_transforms = torchvision.transforms.Compose([
    torchvision.transforms.Resize((224, 224)),
    torchvision.transforms.ToTensor(),
    torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@api_view(['POST'])
def analyze(request):
    data = request.FILES['videoFile']

    # note you need torchcodec (pip install torchcodec) AND ffmpeg installed (brew install ffmpeg)!
    # export DYLD_FALLBACK_LIBRARY_PATH=/opt/homebrew/lib
    
    decoder = torchcodec.decoders.VideoDecoder(data)

    fer2013scores = [0,0,0,0,0,0,0,0]
    totalscore = 0
    numscores = 0

    with torch.no_grad():
        for frame in decoder:

            to_pil = torchvision.transforms.ToPILImage()

            #fer2013 (Emotion)

            grayscale = torchvision.transforms.Grayscale() # create grayscale transform
            normalize = torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            crop = torchvision.transforms.CenterCrop(size=(96, 96))
            resize = torchvision.transforms.Resize((96))
            # fer2013_frame = grayscale(frame) # convert frame into grayscale, since model evaluates grayscale images
            fer2013_frame = resize(frame) # resize frame to fit model
            fer2013_frame = crop(fer2013_frame)
            fer2013_frame = torchvision.transforms.functional.convert_image_dtype(fer2013_frame, torch.float32) # convert datatype of tensor from uint8 to float32
            # fer2013_frame = normalize(fer2013_frame)
            image = to_pil(fer2013_frame)
            image.save('output.png')
            fer2013_frame = fer2013_frame.unsqueeze(0) # unsqueeze is to produce fourth dimension in tensor, batch size
            results = affectnet(fer2013_frame)
            print(results)
            pred = results[0].argmax(0)
            fer2013scores[pred] += 1              


            #nitec (Eye contact)
            frame = torch.permute(frame, (1, 2, 0)) # permute torch tensor to be correct shape
            frame = frame.detach().cpu().numpy() # convert tensor into numpy array, which is what nitec accepts
            results = nitec_pipeline.predict(frame).results
            for result in results:
                totalscore += result
                numscores += 1
    
    return Response([totalscore / numscores, fer2013scores])



