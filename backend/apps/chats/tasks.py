from django.contrib.auth import get_user_model
from django.utils import timezone
from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer

import asyncio

from .models import Chat, Message, OnlineUser
from .serializers import MessageSerializer, OnlineUserSerializer


@shared_task
def send_group(group_name: str, message_data: dict) -> None:
    async def send_msg():
        channel_layer = get_channel_layer()
        await channel_layer.group_send(group_name, message_data)

    # Запуск асинхронной задачи
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        asyncio.run_coroutine_threadsafe(send_msg(), loop)
    else:
        asyncio.run(send_msg())


@shared_task
def update_chat(
    group_name: str,
    user_id: int,
    is_active: bool,
):
    user = get_user_model().objects.get(id=user_id)
    online_user = OnlineUser.objects.get_or_create(user=user)[0]
    online_user.is_active = is_active
    online_user.save()

    serializer = OnlineUserSerializer(online_user)

    send_group.delay(
        group_name,
        {
            "type": "chat_message",
            "category": "change_chat",
            "online_user": serializer.data,
        },
    )


@shared_task
def send_message(
    group_name: str,
    message_type: str,
    id: int,
    from_user_id: int,
    text: str,
    filename: str,
    uuid: str,
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
        text=text,
    )
    if filename:
        message.file.name = filename
        message.save()

    serializer = MessageSerializer(message)

    send_group.delay(
        group_name,
        {
            "type": "chat_message",
            "category": "new_message",
            "message_type": message_type,
            "message": serializer.data,
            "uuid": uuid,
        },
    )


@shared_task
def read_message(
    group_name: str, message_type: str, user_id: int, message_id: int
) -> None:
    user = get_user_model().objects.get(id=user_id)
    message = Message.objects.get(id=message_id)
    message.readers.add(user)
    message.save()

    serializer = MessageSerializer(message)

    send_group.delay(
        group_name,
        {
            "type": "chat_message",
            "category": "change_message",
            "message_type": message_type,
            "message": serializer.data,
        },
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
    message.save()

    serializer = MessageSerializer(message)

    send_group.delay(
        group_name,
        {
            "type": "chat_message",
            "category": "change_message",
            "message_type": message_type,
            "message": serializer.data,
        },
    )


@shared_task
def delete_message(group_name: str, message_type: str, user_id: int, message_id: int):
    from_user = get_user_model().objects.get(id=user_id)
    message = Message.objects.get(id=message_id, from_user=from_user)
    message.state = Message.STATE_DELETE
    message.save()

    serializer = MessageSerializer(message)

    send_group.delay(
        group_name,
        {
            "type": "chat_message",
            "category": "change_message",
            "message_type": message_type,
            "message": serializer.data,
        },
    )


@shared_task
def clean_chat():
    Message.objects.filter(
        modified_date__lt=timezone.now() - timezone.timedelta(days=1)
    ).delete()


@shared_task
def update_videochat(
    group_name: str,
    message_type: str,
    from_user_id: int,
    to_id: int,
    category: str,
) -> None:
    from_user_fullname = ""
    title = ""

    if message_type == "user":
        from_user = get_user_model().objects.filter(id=from_user_id).first()

        if from_user:
            from_user_fullname = from_user.full_name

        to_user = get_user_model().objects.filter(id=to_id).first()

        if to_user:
            title = to_user.full_name
    else:
        group = Chat.objects.filter(id=to_id).first()

        if group:
            title = group.title

    send_group.delay(
        group_name,
        {
            "type": "chat_message",
            "category": category,
            "message_type": message_type,
            "from_user_id": from_user_id,
            "from_user_fullname": from_user_fullname,
            "to_id": to_id,
            "title": title,
        },
    )
