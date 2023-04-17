from celery import shared_task

from django.contrib.auth import get_user_model
from django.utils import timezone
from asgiref.sync import async_to_sync

from channels.layers import get_channel_layer

from .models import Chat, Message, Reader
from .serializers import (
    ChatSerializer,
    MessageSerializer,
)


@shared_task
def create_chat(
    group_name: str,
    user_id: int,
    title: str,
    is_group: str,
    admins: list[int],
    users: list[int]
):
    user = get_user_model().objects.get(
        id=user_id
    )

    chat = Chat.objects.create(
        title=title,
        is_group=is_group,
    )
    chat.admins.set([*admins, user.id])
    chat.users.set([*users, user.id])
    chat.save()

    serializer = ChatSerializer(chat)

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "new_chat",
            "chat": serializer.data
        }
    )


@shared_task
def update_chat(group_name: str, user_id: int, is_join: bool):
    user = get_user_model().objects.get(id=user_id)

    chats = Chat.objects.filter(users__in=[user])

    channel_layer = get_channel_layer()

    for chat in chats:
        if is_join:
            chat.actives.add(user)
        else:
            chat.actives.remove(user)

        chat.save()

        serializer = ChatSerializer(chat)

        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "change_chat",
                "category": "join_chat",
                "chat": serializer.data
            }
        )


@shared_task
def delete_chat(
    group_name: str,
    user_id: int,
    chat_id: int
):
    user = get_user_model().objects.get(id=user_id)

    chat = Chat.objects.get(id=chat_id, admins__in=[user])
    chat.delete()

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "remove_chat",
            "chat_id": chat_id
        }
    )


@shared_task
def send_message(
    chat_group_name: str,
    chat_id: int,
    user_id: int,
    text: str,
    file_path: str
):
    chat = Chat.objects.get(id=chat_id)

    user = get_user_model().objects.get(id=user_id)

    message = Message.objects.create(
        chat=chat,
        from_user=user,
        text=text
    )

    message_serializer = MessageSerializer(message)

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        chat_group_name,
        {
            "type": "new_message",
            "message": message_serializer.data,
        }
    )


@shared_task
def read_message(
    chat_group_name: str,
    user_id: int,
    message_id: int
):
    user = get_user_model().objects.get(id=user_id)

    message = Message.objects.get(id=message_id)

    Reader.objects.create(
        message=message,
        user=user
    )

    serializer = MessageSerializer(message)

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        chat_group_name,
        {
            "type": "change_message",
            "message": serializer.data
        }
    )


@shared_task
def delete_message(
    chat_group_name: str,
    user_id: int,
    message_id: int
):
    user = get_user_model().objects.get(id=user_id)

    message = Message.objects.get(id=message_id, from_user=user)
    message.delete()

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        chat_group_name,
        {
            "type": "remove_message",
            "message_id": message_id,
            "user_id": user_id,
            "delete_date": timezone.now(),
        }
    )
