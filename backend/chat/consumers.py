# Django
from django.contrib.auth import get_user_model

# Channels
from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer

# Project
from chat.models import Room, Message
from chat.serializers import MessageSerializer


User = get_user_model()


class ChatConsumer(JsonWebsocketConsumer):
    """Consumer for chat."""
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.user = None
        self.room_id = None
        self.room = None

    def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = "chat_%s" % self.room_id
        
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            return
               

        self.room = Room.objects.filter(id=self.room_id).first()
        if not self.room:
            return

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name, self.channel_name
        )
        
        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name, self.channel_name
        )

    # Receive message from WebSocket
    def receive_json(self, content, **kwargs):
        message_type = content["type"]

        if message_type == "chat_message":
            message = Message.objects.create(
                room = self.room,
                user = self.user,
                msg = content["message"]
            )


            # Send message to room group
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name, 
                {
                    "type": "chat_message",
                    "message": MessageSerializer(message).data,
                },
            )

        return super().receive_json(content, **kwargs)

    def chat_message(self, event):
        self.send_json(event)
