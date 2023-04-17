# Django
from django.contrib.auth import get_user_model

# Channels
from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer

# Project
from .models import Chat
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ValidationError
from .tasks import (
    join_chat,
    quit_chat,
    send_message,
    read_message,
    delete_message,
)


User = get_user_model()


class ChatConsumer(JsonWebsocketConsumer):
    """Consumer for chat."""
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.chat_id = None
        self.chat = None
        self.chat_group_name = None

    def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.chat_group_name = "chat_%s" % self.chat_id

        self.user = self.scope["user"]
        if type(self.user) == AnonymousUser:
            raise ValidationError('User not found.')

        self.chat = Chat.objects.filter(id=self.chat_id).first()
        if not self.chat:
            raise ValidationError('Chat not found.')

        self.accept()

        async_to_sync(self.channel_layer.group_add)(
            self.chat_group_name, self.channel_name
        )

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.chat_group_name, self.channel_name
        )

    def receive_json(self, content, **kwargs):
        message = content["message"]

        if message == 'join_chat':
            join_chat.delay(
               self.chat_group_name,
               self.chat.id,
               self.user.id
            )
        elif message == "quit_chat":
            quit_chat.delay(
               self.chat_group_name,
               self.chat.id,
               self.user.id
            )
        elif message == "send_message":
            send_message.delay(
               self.chat_group_name,
               self.chat.id,
               self.user.id,
               content['text'],
               content['file_path']
            )
        elif message == "read_message":
            read_message.delay(
               self.chat_group_name,
               self.chat.id,
               self.user.id,
               content['message_id']
            )
        elif message == "delete_message":
            delete_message.delay(
               self.chat_group_name,
               self.chat.id,
               self.user.id,
               content['message_id']
            )

    def send_group(self, event):
        self.send_json(event)
