# Serializers convert complex data into native Python datatypes

from django.contrib.auth.models import Group, User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model = User 
        fields = ['id', 'username', 'password', 'email']

from .models import modelResponses

class modelResponsesSerializer(serializers.ModelSerializer):
    class Meta:
        model = modelResponses
        fields = ['id', 'feedback_text', 'speech_emotion', 'facial_expressions', 'created_at']