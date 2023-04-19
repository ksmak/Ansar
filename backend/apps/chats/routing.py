# Django
from django.urls import path

# Project
from chats.consumers import (
    ChatConsumer,
    MessageConsumer,
)

websocket_urlpatterns = [
    path("ws/chat", ChatConsumer.as_asgi()),
    path("ws/message/<str:type>/<int:id>", MessageConsumer.as_asgi()),
]
