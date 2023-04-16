from celery import shared_task

from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync

from channels.layers import get_channel_layer

from .models import Chat, Message
from .serializers import MessageSerializer


@shared_task
def join_chat(chat_group_name: str, chat_id: int, user_id: int):
    chat = Chat.objects.get(id=chat_id)
    user = get_user_model().objects.get(id=user_id)

    channel_layer = get_channel_layer()

    chat.actives.add(user)
    chat.save()

    async_to_sync(channel_layer.group_send)(
        chat_group_name,
        {
            "type": "update_chat",
            "chat": chat.id,
            "user": user.id
        }
    )


@shared_task
def quit_chat(chat_group_name: str, chat_id: int, user_id: int):
    chat = Chat.objects.get(id=chat_id)
    user = get_user_model().objects.get(id=user_id)

    channel_layer = get_channel_layer()

    chat.actives.remove(user)
    chat.save()

    async_to_sync(channel_layer.group_send)(
        chat_group_name,
        {
            "type": "update_chat",
            "chat": chat.id,
            "user": user.id
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
    message = Message.objects.create(
        chat=chat_id,
        from_user=user_id,
        text=text
    )

    serializer = MessageSerializer(message)

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        chat_group_name,
        {
            "type": "update_message",
            "message": serializer.data,
        }
    )
