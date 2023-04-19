# Django
from django.contrib.auth import get_user_model

# Channels
from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer

# Project
from .models import Chat
from django.core.exceptions import ValidationError
from .tasks import (
    create_chat,
    update_chat,
    delete_chat,
    send_message,
    read_message,
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
        message = content["message"]

        if message == 'create_chat':
            create_chat.delay(
                group_name=self.group_name,
                user_id=self.user.id,
                title=content['title'],
                is_group=content['is_group'],
                admins=content['admins'],
                users=content['users']
            )
        elif message == 'join_chat':
            update_chat.delay(
               self.group_name,
               self.user.id,
               True
            )
        elif message == "quit_chat":
            update_chat.delay(
               self.group_name,
               self.user.id,
               False
            )
        elif message == "delete_chat":
            delete_chat.delay(
                self.group_name,
                self.user.id,
                content["chat_id"]
            )

    def new_chat(self, event):
        self.send_json(event)

    def change_chat(self, event):
        self.send_json(event)

    def remove_chat(self, event):
        self.send_json(event)


class MessageConsumer(JsonWebsocketConsumer):
    """Consumer for chat."""
    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.type = None
        self.id = None
        self.from_user = None
        self.group_name = None

    def connect(self):
        self.type = self.scope["url_route"]["kwargs"]["type"]
        self.id = self.scope["url_route"]["kwargs"]["id"]
        
        self.group_name = "%s_chat_%s" % (self.type, self.id)

        self.from_user = self.scope["user"]
        if type(self.from_user) != User:
            raise ValidationError('Sender user not found.')

        if self.type == "user":
            user = User.objects.filter(id=self.id).first()
            if not user:
                raise ValidationError('User not found.')
        else:
            chat = Chat.objects.filter(id=self.id).first()
            if not chat:
                raise ValidationError('Chat not found.')

        self.accept()

        async_to_sync(self.channel_layer.group_add)(
            self.group_name, self.channel_name
        )

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name, self.channel_name
        )

    def receive_json(self, content, **kwargs):
        message = content["message"]

        if message == "send_message":
            send_message.delay(
               self.group_name,
               self.type,
               self.id,
               self.from_user.id,
               content['text'],
               content['file_path']
            )
        elif message == "read_message":
            read_message.delay(
               self.group_name,
               self.type,
               self.from_user.id,
               content['message_id']
            )
        elif message == "delete_message":
            delete_message.delay(
               self.group_name,
               self.type,
               self.from_user.id,
               content['message_id']
            )

    def new_message(self, event):
        self.send_json(event)

    def change_message(self, event):
        self.send_json(event)

    def remove_message(self, event):
        self.send_json(event)
