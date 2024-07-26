from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .tasks import (
    update_chat,
    update_message,
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

        await self.channel_layer.group_add(self.group_name, self.channel_name)

        await self.accept()

        update_chat.delay(
            group_name=self.group_name, from_id=self.user.id, is_active=True
        )

    async def disconnect(self, exit_code):
        update_chat.delay(
            group_name=self.group_name, from_id=self.user.id, is_active=False
        )

        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        if content["message"] == "send_call":
            update_videochat.delay(
                group_name=self.group_name,
                action="call",
                message_type=content["message_type"],
                from_id=self.user.id,
                to_id=content["to_id"],
                desc=None,
            )
        elif content["message"] == "send_cancel":
            update_videochat.delay(
                group_name=self.group_name,
                action="cancel",
                message_type=content["message_type"],
                from_id=self.user.id,
                to_id=content["to_id"],
                desc=None,
            )
        elif content["message"] == "send_accept":
            update_videochat.delay(
                group_name=self.group_name,
                action="accept",
                message_type=content["message_type"],
                from_id=self.user.id,
                to_id=content["to_id"],
                desc=None,
            )
        elif content["message"] == "send_offer":
            update_videochat.delay(
                group_name=self.group_name,
                action="offer",
                message_type=content["message_type"],
                from_id=self.user.id,
                to_id=content["to_id"],
                desc=content["desc"],
            )
        elif content["message"] == "send_answer":
            update_videochat.delay(
                group_name=self.group_name,
                action="answer",
                message_type=content["message_type"],
                from_id=self.user.id,
                to_id=content["to_id"],
                desc=content["desc"],
            )
        elif content["message"] == "send_candidate":
            update_videochat.delay(
                group_name=self.group_name,
                action="candidate",
                message_type=content["message_type"],
                from_id=self.user.id,
                to_id=content["to_id"],
                desc=content["desc"],
            )
        elif content["message"] == "send_new":
            update_message.delay(
                group_name=self.group_name,
                action="new",
                message_type=content["message_type"],
                from_id=self.user.id,
                to_id=content["to_id"],
                text=content["text"],
                file=content["file"],
                message_id=content["message_id"],
            )
        elif content["message"] == "send_read":
            update_message.delay(
                group_name=self.group_name,
                action="read",
                message_type=content["message_type"],
                from_id=self.user.id,
                to_id=None,
                text=None,
                file=None,
                message_id=content["message_id"],
            )
        elif content["message"] == "send_edit":
            update_message.delay(
                group_name=self.group_name,
                action="edit",
                message_type=content["message_type"],
                from_id=self.user.id,
                to_id=None,
                text=content["text"],
                file=None,
                message_id=content["message_id"],
            )
        elif content["message"] == "send_delete":
            update_message.delay(
                group_name=self.group_name,
                action="delete",
                message_type=content["message_type"],
                from_id=self.user.id,
                to_id=None,
                text=None,
                file=None,
                message_id=content["message_id"],
            )

    async def chat_message(self, event):
        await self.send_json(event)
