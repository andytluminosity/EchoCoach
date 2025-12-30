"""
URL configuration for echocoach project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path
from django.contrib import admin
from rest_framework import routers
from rest_framework.authtoken.views import ObtainAuthToken

from echocoach.myapp import views
from pytorch_folder import views as pytorchviews

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', views.index, name="home"),
    path('admin/', admin.site.urls),

    # test view - go to http://127.0.0.1:8000/test/

    path('test/', views.index, name="index"),
    path('register/', views.register, name="Register"),
    path('login/', views.login, name="Login"),
    path('user/', views.getUserData, name="User"),

    path('analyze-facial/', pytorchviews.analyze_facial, name="Analyze-Facial"),
    path('analyze-voice/', pytorchviews.analyze_voice, name="Analyze-Voice"),

    path('model-response/', views.addAndGetModelResponses, name="Model-Response"),

    path('recordings/', views.storeAndGetRecordings, name="Recordings"),

    path('speech-to-text/', views.speech_to_text, name="Speech-to-Text"),

    path('ai-feedback/', views.give_ai_feedback, name="AI-Feedback"),

    path('get-results/', views.get_results, name="Get-Results"),
    path('save-result/', views.save_result, name="Save-Result"),
    path('delete-result/', views.delete_result, name="Delete-Result"),
    path('update-favourite-result/', views.update_favourite_result, name="Update-Favourite-Result"),

    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]
