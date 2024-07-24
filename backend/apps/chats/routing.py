# Django
from django.urls import path

# Project
from chats.consumers import ChatConsumer


websocket_urlpatterns = [
    path("ws/chat/", ChatConsumer.as_asgi()),
]
