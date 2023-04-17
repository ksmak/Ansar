# Django
from django.urls import path

# Project
from chats.consumers import (
    ChatConsumer,
    MessageConsumer,
)

websocket_urlpatterns = [
    path("ws/chat", ChatConsumer.as_asgi()),
    path("ws/messages/<int:chat_id>", MessageConsumer.as_asgi()),
]
