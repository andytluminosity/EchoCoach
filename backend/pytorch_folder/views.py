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

from echocoach.myapp.serializers import UserSerializer

from django.http import HttpResponse

import torch
import torchcodec
from nitec import NITEC_Classifier, visualize
import cv2
import pathlib
CWD = pathlib.Path.cwd()

nitec_pipeline = NITEC_Classifier(
    weights= CWD / "pytorch_folder" / "nitec" / "models" / 'nitec_rs18_e20.pth',
    device=torch.device('cpu') # or 'cpu'
)

@api_view(['POST'])
def analyze(request):
    data = request.FILES['videoFile']

    # note you need torchcodec (pip install torchcodec) AND ffmpeg installed (brew install ffmpeg)!
    
    decoder = torchcodec.decoders.VideoDecoder(data)

    totalscore = 0
    numscores = 0

    with torch.no_grad():
        for frame in decoder:
            frame = torch.permute(frame, (1, 2, 0)) # permute torch tensor to be correct shape
            frame = frame.detach().cpu().numpy() # convert tensor into numpy array, which is what nitec accepts
            results = nitec_pipeline.predict(frame).results
            for result in results:
                totalscore += result
                numscores += 1
    
    return Response(totalscore / numscores)



