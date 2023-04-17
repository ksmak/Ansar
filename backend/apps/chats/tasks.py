from celery import shared_task

from django.contrib.auth import get_user_model
from django.utils import timezone
from asgiref.sync import async_to_sync

from channels.layers import get_channel_layer

from .models import Chat, Message, Journal
from .serializers import (
    MessageSerializer,
    JournalSerializer,
)


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
            "type": "send_group",
            "category": "join_chat",
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
            "type": "send_group",
            "category": "quit_chat",
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
    chat = Chat.objects.get(id=chat_id)
    user = get_user_model().objects.get(id=user_id)
    message = Message.objects.create(
        chat=chat,
        from_user=user,
        text=text
    )

    journal = Journal.objects.create(
        action=Journal.MESSAGE_CREATED,
        user_id=user_id,
        message_id=message.id,
        action_date=message.creation_date
    )

    message_serializer = MessageSerializer(message)
    journal_serializer = JournalSerializer(journal)

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        chat_group_name,
        {
            "type": "send_group",
            "category": "send_message",
            "message": message_serializer.data,
            "journal": journal_serializer.data
        }
    )


@shared_task
def read_message(
    chat_group_name: str,
    chat_id: int,
    user_id: int,
    message_id: int
):
    user = get_user_model().objects.get(id=user_id)
    message = Message.objects.get(id=message_id)
    journal = Journal.objects.create(
        action=Journal.MESSAGE_READ,
        user_id=user.id,
        message_id=message.id,
        action_date=timezone.now()
    )

    journal_serializer = JournalSerializer(journal)

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        chat_group_name,
        {
            "type": "send_group",
            "category": "read_message",
            "chat_id": chat_id,
            "user_id": user_id,
            "journal": journal_serializer.data
        }
    )


@shared_task
def delete_message(
    chat_group_name: str,
    chat_id: int,
    user_id: int,
    message_id: int
):
    user = get_user_model().objects.get(id=user_id)
    message = Message.objects.get(id=message_id, from_user=user)
    message.delete()

    journal = Journal.objects.create(
        action=Journal.MESSAGE_DELETED,
        user_id=user.id,
        message_id=message_id,
        action_date=timezone.now()
    )

    journal_serializer = JournalSerializer(journal)

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        chat_group_name,
        {
            "type": "send_group",
            "category": "delete_message",
            "chat_id": chat_id,
            "user_id": user_id,
            "journal": journal_serializer.data,
        }
    )

    delete_journal.apply_async(
        (message_id, ),
        countdown=60 * 60 * 1
    )


@shared_task
def delete_journal(message_id: int):
    Journal.objects.filter(message_id=message_id).delete()
