from django.db import models
import uuid

# Create your models here. Models define our 'database layout'

# Here is a test Post model. Think of this as defining a data table called Posts, with a post_text column and pub_date column for each post.
# Each column is called a Field, and are instances of Field classes (e.g CharField).
# Some fields have parameters like max_length. 
# pub_date is machine-readable name of Field, while "date published" is optional human-readable name.

class Post(models.Model):
    post_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField("date published")

class Reply(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    reply_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)

# To activate model: Add echocoach.myapp.apps.MyappConfig to INSTALLED_APPS in settings.py
#   Note: Change name of app in app.py to 'echocoach.myapp' (rather than 'myapp')
#   Run 'python manage.py makemigrations myapp' to tell Django that our models have been updated.
#   Run 'python manage.py migrate' to create model tables in database.

class modelResponses(models.Model):
    # Response ID (UUID v4)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # User the response is for
    user = models.CharField(max_length=200, default="")

    # Feedback for the interview
    feedback_text = models.TextField(default="")

    # Overall emotion of the user 
    speech_emotion = models.CharField(max_length=200, default="")

    # Facial expressions of the user over time
    #   Make sure we feed in {"expression": str, "startTime": int}
    facial_expressions = models.JSONField(default=list)

    # Response creation date
    created_at = models.DateTimeField(auto_now_add=True)
    
    

