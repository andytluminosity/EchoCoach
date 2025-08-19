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

from echocoach.myapp.serializers import UserSerializer, modelResponsesSerializer


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
    token, created = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(user)
    res = Response(token.key)
    
    return res

@api_view(['GET'])
def getUserData(request):
    permission_classes = (IsAuthenticated,)
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
def createModelResponse(request):
    serializer = modelResponsesSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def getModelMostRecentResponses(request):
    numResponses = int(request.query_params.get('numResponses', 1))
    modelResponses = modelResponses.objects.order_by('-created_at')[:numResponses]
    serializer = modelResponsesSerializer(modelResponses, many=True)
    return Response(serializer.data)
