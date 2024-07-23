# Django
from django.urls import path

# Project
from chats.consumers import ChatConsumer


websocket_urlpatterns = [
    path("ws/chat/<int:group>", ChatConsumer.as_asgi()),
]
