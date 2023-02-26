# chat/routing.py
from django.urls import re_path

from chat.consumers import ChatConsumer

websocket_urlpatterns = [
    re_path(r"rooms/(?P<room_id>\w+)/$", ChatConsumer.as_asgi()),
]