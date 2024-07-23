# Django
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from asgiref.sync import async_to_sync

# Channels
from channels.generic.websocket import AsyncJsonWebsocketConsumer

# Project
from .tasks import (
    update_chat,
    send_message,
    read_message,
    change_message,
    delete_message,
)


User = get_user_model()


class ChatConsumer(AsyncJsonWebsocketConsumer):
    """Consumer for chat."""
    def __init__(self, *args, **kwargs):
        super().__init__(self, *args, **kwargs)
        self.user = None
        self.group_name = 'chat'

    async def connect(self):
        self.user = self.scope["user"]
        if type(self.user) != User:
            raise ValidationError("User not found.")
        
        self.group = self.scope["url_route"]["kwargs"]["group"]
        self.group_name = f"chat_{self.group}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        update_chat.delay(
            self.group_name,
            self.user.id,
            True,
        )

    async def disconnect(self, close_code):
        update_chat.delay(
            self.group_name,
            self.user.id,
            False,
        )
        
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )


    async def receive_json(self, content, **kwargs):
        if content["message"] == "send_message":
            send_message.delay(
               self.group_name,
               content["message_type"],
               content["id"],
               self.user.id,
               content['text'],
               content['filename'],
               content['uuid']
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

    async def chat_message(self, event):
        await self.send_json(event)
