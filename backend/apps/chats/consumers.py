# Django
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from asgiref.sync import async_to_sync

# Channels
from channels.generic.websocket import JsonWebsocketConsumer

# Project
from .tasks import (
    update_chat,
    send_message,
    read_message,
    change_message,
    delete_message,
)


User = get_user_model()


class ChatConsumer(JsonWebsocketConsumer):
    """Consumer for chat."""
    def __init__(self, *args, **kwargs):
        super().__init__(self, *args, **kwargs)
        self.user = None
        self.group_name = 'chat'

    def connect(self):
        self.user = self.scope["user"]
        if type(self.user) != User:
            raise ValidationError("User not found.")

        self.accept()

        async_to_sync(self.channel_layer.group_add)(
            self.group_name, self.channel_name
        )

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name, self.channel_name
        )

    def receive_json(self, content, **kwargs):
        if content["message"] == 'join_chat':
            update_chat.delay(
               self.group_name,
               self.user.id,
               True,
            )
        elif content["message"] == "quit_chat":
            update_chat.delay(
               self.group_name,
               self.user.id,
               False,
            )
        elif content["message"] == "send_message":
            send_message.delay(
               self.group_name,
               content["message_type"],
               content["id"],
               self.user.id,
               content['text'],
               content['filename'],
            )
        elif content["message"] == "read_message":
            read_message.delay(
               self.group_name,
               content["message_type"],
               self.user.id,
               content['message_id'],
            )
        elif content["message"] == "edit_message":
            change_message.delay(
               self.group_name,
               content["message_type"],
               self.user.id,
               content['message_id'],
               content['text'],
            )
        elif content["message"] == "delete_message":
            delete_message.delay(
               self.group_name,
               content["message_type"],
               self.user.id,
               content['message_id'],
            )

    def chat_message(self, event):
        self.send_json(event)
