from django.contrib.auth import get_user_model
from django.utils import timezone
from asgiref.sync import async_to_sync

from celery import shared_task
from channels.layers import get_channel_layer

from .models import Chat, Message, Reader
from .serializers import (
    ChatSerializer,
    MessageSerializer,
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
                "type": "chat_message",
                "category": "change_chat",
                "chat": serializer.data
            }
        )


@shared_task
def send_message(
    group_name: str,
    message_type: str,
    id: int,
    from_user_id: int,
    text: str,
    filename: str
) -> None:
    user = None
    chat = None
    if message_type == "user":
        user = get_user_model().objects.get(id=id)
    else:
        chat = Chat.objects.get(id=id)

    from_user = get_user_model().objects.get(id=from_user_id)

    message = Message.objects.create(
        from_user=from_user,
        to_user=user,
        to_chat=chat,
        text=text
    )

    if filename:
        message.file.name = filename
        message.save()

    message_serializer = MessageSerializer(message)

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "chat_message",
            "category": "new_message",
            "message_type": message_type,
            "message": message_serializer.data,
        }
    )


@shared_task
def read_message(
    group_name: str,
    message_type: str,
    user_id: int,
    message_id: int
) -> None:
    user = get_user_model().objects.get(id=user_id)

    message = Message.objects.get(id=message_id)

    Reader.objects.get_or_create(
        message=message,
        user=user
    )

    serializer = MessageSerializer(message)

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "chat_message",
            "category": "change_message",
            "message_type": message_type,
            "message": serializer.data
        }
    )


@shared_task
def change_message(
    group_name: str,
    message_type: str,
    user_id: int,
    message_id: int,
    text: str,
):
    from_user = get_user_model().objects.get(id=user_id)

    message = Message.objects.get(id=message_id, from_user=from_user)
    message.text = text
    message.change_date = timezone.now()
    message.save()

    serializer = MessageSerializer(message)

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "chat_message",
            "category": "change_message",
            "message_type": message_type,
            "message": serializer.data,
        }
    )


@shared_task
def delete_message(
    group_name: str,
    message_type: str,
    user_id: int,
    message_id: int
):
    from_user = get_user_model().objects.get(id=user_id)

    message = Message.objects.get(id=message_id, from_user=from_user)
    message.state = Message.STATE_DELETE
    message.delete_date = timezone.now()
    message.save()

    Reader.objects.filter(message=message).delete()

    serializer = MessageSerializer(message)

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "chat_message",
            "category": "change_message",
            "message_type": message_type,
            "message": serializer.data,
        }
    )
