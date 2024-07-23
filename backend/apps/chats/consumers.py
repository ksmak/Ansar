# Django
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

# Channels
from channels.generic.websocket import AsyncJsonWebsocketConsumer

# Project
from .tasks import (
    update_chat,
    send_message,
    read_message,
    change_message,
    delete_message,
    update_videochat,
)


User = get_user_model()


class ChatConsumer(AsyncJsonWebsocketConsumer):
    """Consumer for chat."""

    def __init__(self, *args, **kwargs):
        super().__init__(self, *args, **kwargs)
        self.user = None
        self.group_name = "chat"

    async def connect(self):
        self.user = self.scope["user"]
        if type(self.user) != User:
            raise ValidationError("User not found.")

        self.group = self.scope["url_route"]["kwargs"]["group"]
        self.group_name = f"chat_{self.group}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)

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

        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        if content["message"] == "send_message":
            send_message.delay(
                self.group_name,
                content["message_type"],
                content["id"],
                self.user.id,
                content["text"],
                content["filename"],
                content["uuid"],
            )
        elif content["message"] == "read_message":
            read_message.delay(
                self.group_name,
                content["message_type"],
                self.user.id,
                content["message_id"],
            )
        elif content["message"] == "edit_message":
            change_message.delay(
                self.group_name,
                content["message_type"],
                self.user.id,
                content["message_id"],
                content["text"],
            )
        elif content["message"] == "delete_message":
            delete_message.delay(
                self.group_name,
                content["message_type"],
                self.user.id,
                content["message_id"],
            )
        elif content["message"] == "calling_videochat":
            update_videochat.delay(
                self.group_name,
                content["message_type"],
                self.user.id,
                content["to_id"],
                "call_videochat",
            )
        elif content["message"] == "canceling_videochat":
            update_videochat.delay(
                self.group_name,
                content["message_type"],
                self.user.id,
                content["to_id"],
                "cancel_videochat",
            )
        elif content["message"] == "accepting_videochat":
            update_videochat.delay(
                self.group_name,
                content["message_type"],
                self.user.id,
                content["to_id"],
                "accept_videochat",
            )
        elif content["message"] == "new_offer_videochat":
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat_message",
                    "category": "offer_videochat",
                    "offer": content["offer"],
                },
            )
        elif content["message"] == "new_answer_videochat":
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat_message",
                    "category": "answer_videochat",
                    "answer": content["answer"],
                },
            )
        elif content["message"] == "new_candidate_videochat":
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat_message",
                    "category": "answer_videochat",
                    "candidate": content["candidate"],
                },
            )

    async def chat_message(self, event):
        await self.send_json(event)
