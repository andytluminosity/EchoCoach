"""
ASGI config for echocoach project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
import uvicorn

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'echocoach.settings')

application = get_asgi_application()

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))  # Render sets PORT environment variable
    
    uvicorn.run(application, host=host, port=port)
