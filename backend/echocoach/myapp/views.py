from django.shortcuts import render

# Create your views here.

# Views are python functions which takes a web request and returns a web response (e.g html page)

# Viewsets are basically 'classes' of views. AKA a group of views with common behvaiour.

from rest_framework.decorators import api_view, authentication_classes, permission_classes
from django.contrib.auth.models import Group, User
from django.contrib.auth import authenticate, login
from rest_framework import permissions, viewsets, authentication, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404

from echocoach.myapp.serializers import UserSerializer, modelResponsesSerializer, videoRecordingsSerializer
from echocoach.myapp.models import modelResponses, videoRecordings

import whisper
import tempfile
import os
import openai

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

# Test view - individual view, not viewset!

from django.http import HttpResponse

def index(request):
    return HttpResponse("Hello, world. You're at the test index.")

@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        user = User.objects.get(username=request.data['username'])
        user.set_password(request.data['password'])
        user.save()
        token = Token.objects.create(user=user)
        return Response({'token': token.key, 'user': serializer.data})
    return Response(serializer.errors, status=status.HTTP_200_OK)

@api_view(['POST'])
def login(request):
    user = get_object_or_404(User, username=request.data['username'])
    if not user.check_password(request.data['password']):
        return Response("missing user", status=status.HTTP_404_NOT_FOUND)
    token = Token.objects.get_or_create(user=user)[0]
    res = Response({'key': token.key, 'user': request.data['username']})
    
    return res

@api_view(['GET'])
def getUserData(request):
    permission_classes = (IsAuthenticated,)
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST', 'GET'])
def addAndGetModelResponses(request):
    if request.method == 'POST':
        # Create model response
        serializer = modelResponsesSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    else:
        # Get model response
        user = request.query_params.get('user', None)
        numResponses = request.query_params.get('numResponses')

        results = modelResponses.objects.filter(user=user).order_by('-created_at')

        if numResponses:
            results = results[:int(numResponses)]

        serializer = modelResponsesSerializer(results, many=True)
        return Response(serializer.data)

@api_view(['POST', 'GET'])
def storeAndGetRecordings(request):
    if request.method == 'POST':
        # Store recording
        video_file = request.FILES.get('videoFile')

        # Get the other fields from request.data
        recording_data = {
            'id': request.data.get('id'),
            'user': request.data.get('user'),
            'recording': video_file,
        }

        serializer = videoRecordingsSerializer(data=recording_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        # Get recordings
        user = request.query_params.get('user', None)
        numRecordings = request.query_params.get('numRecordings')

        results = videoRecordings.objects.filter(user=user).order_by('-created_at')

        if numRecordings:
            results = results[:int(numRecordings)]

        serializer = videoRecordingsSerializer(results, many=True)
        return Response(serializer.data)

# Load the model (small/medium/large depending on accuracy vs speed)
model = whisper.load_model("base.en")

@api_view(['POST'])
def speech_to_text(request):
    # Assumes .wav file
    speech_file = request.FILES.get('videoFile')

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp_file:
            for chunk in speech_file.chunks():
                tmp_file.write(chunk)
            tmp_file_path = tmp_file.name

        # Result is a dictionary
        result = model.transcribe(tmp_file_path)

        # Return the text as a string
        return Response(result["text"].strip())

    finally:
        os.unlink(tmp_file_path)

@api_view(['POST'])
def give_ai_feedback(request):
    question = request.data.get('question')
    text = request.data.get('text')
    emotion = request.data.get('emotion')
    word_limit = request.data.get('word_limit')

    # Not sure how we should handle the facial expressions
    # I'll let you figure it out - Andy 

    # Note: We should store the API key in the database 
    #       and retrieve it here. This is here temporarily
    openai.api_key = request.data.get('api_key')

    response = openai.chat.completions.create(
        model = "gpt-4o-mini",
        messages = [
            {
                "role": "system",
                "content": """
                    You are an expert career coach who helps candidates improve their  
                    interview answers.

                    Provide constructive, actionable, and polite feedback. Focus on 
                    clarity, confidence, content, and professionalism. Include 
                    strengths, areas to improve, and example phrasing suggestions.

                    Keep your feedback concise and strictly under {word_limit} words.
                    """
            },
            {
                "role": "user",
                "content": f"""
                Interview question: {question}

                Candidate's answer: {text}

                Dominant emotion in delivery: {emotion}

                Please take the candidate's answer and dominant emotion 
                into account when providing feedback.

                Keep your feedback concise and strictly under {word_limit} words.
                """
            }
        ],
        max_tokens = int(word_limit * 1.5),
        temperature = 0.3
    )

    feedback = response.choices[0].message.content

    return Response(feedback)

    