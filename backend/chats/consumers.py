# Django
from django.contrib.auth import get_user_model

# Channels
from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer

# Project
from .models import Chat, Message
from .serializers import MessageSerializer


User = get_user_model()


class ChatConsumer(JsonWebsocketConsumer):
    """Consumer for chat."""
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.chat_id = None
        self.chat_group_name = None

    def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.chat_group_name = "chat_%s" % self.chat_id

        self.user = self.scope["user"]
        if not self.user and not self.user.is_authenticated:
            return

        self.chat = Chat.objects.filter(id=self.chat_id).first()
        if not self.chat:
            return

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

        if message == "send_message":
            message = Message.objects.create(
                chat=self.chat,
                from_user=self.user,
                msg=content['msg']
            )

            async_to_sync(self.channel_layer.group_send)(
                self.chat_group_name,
                {
                    "type": "send_message",
                    "message": MessageSerializer(message).data,
                },
            )

    def send_message(self, event):
        self.send_json(event['message'])
