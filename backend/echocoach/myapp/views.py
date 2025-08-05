from django.shortcuts import render

# Create your views here.

# Views are python functions which takes a web request and returns a web response (e.g html page)

# Viewsets are basiclaly 'classes' of views. AKA a group of views with common behvaiour.

from django.contrib.auth.models import Group, User
from django.contrib.auth import authenticate, login
from rest_framework import permissions, viewsets

from echocoach.myapp.serializers import GroupSerializer, UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    # permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


# Test view - individual view, not viewset!

from django.http import HttpResponse

def index(request):
    return HttpResponse("Hello, world. You're at the test index.")

# def login(request):
#     username = request.POST["username"]
#     password = request.POST["password"]
#     user = authenticate(request, username=username, password=password)
#     if user is not None:
#         login(request, user)
#     else:
#         # redirect user

