# Python
import os

# Channels
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

# Django
from django.core.asgi import get_asgi_application

# Project
from chat.routing import websocket_urlpatterns
from chat.middleware import TokenAuthMiddleWare

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.base')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddleWare(
        AllowedHostsOriginValidator(
            URLRouter(websocket_urlpatterns),
        )),
})
