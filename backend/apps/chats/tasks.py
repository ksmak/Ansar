from django.contrib.auth import get_user_model
from django.utils import timezone
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
    from_id: int,
    is_active: bool,
):
    online_user = OnlineUser.objects.get_or_create(user=from_id)[0]
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
def update_videochat(
    group_name: str,
    message_type: str,
    from_id: int,
    to_id: int,
    action: str,
    desc: dict,
) -> None:
    from_fullname = ""

    to_title = ""

    if message_type == "user":
        from_user = get_user_model().objects.filter(id=from_id).first()

        if from_user:
            from_fullname = from_user.full_name

        to_user = get_user_model().objects.filter(id=to_id).first()

        if to_user:
            to_title = to_user.full_name
    else:
        group = Chat.objects.filter(id=to_id).first()

        if group:
            to_title = group.title

    send_group.delay(
        group_name,
        {
            "type": "chat_message",
            "category": action,
            "message_type": message_type,
            "from_id": from_id,
            "from_fullname": from_fullname,
            "to_id": to_id,
            "to_title": to_title,
            "desc": desc,
        },
    )


@shared_task
def update_message(
    group_name: str,
    action: str,
    message_type: str,
    from_id: int,
    to_id: int,
    text: str,
    file: str,
    message_id: str,
) -> None:
    if action == "new":
        to_user = None

        to_chat = None

        if message_type == "user":
            to_user = get_user_model().objects.get(id=to_id)

        else:
            to_chat = Chat.objects.get(id=to_id)

        from_user = get_user_model().objects.get(id=from_id)

        message = Message.objects.create(
            from_user=from_user,
            to_user=to_user,
            to_chat=to_chat,
            text=text,
        )

        if file:
            message.file.name = file
            message.save()

        serializer = MessageSerializer(message)

        send_group.delay(
            group_name,
            {
                "type": "chat_message",
                "category": "new_message",
                "message_type": message_type,
                "message": serializer.data,
                "message_id": message_id,
            },
        )

    elif action == "read":
        from_user = get_user_model().objects.get(id=from_id)

        message = Message.objects.get(id=message_id)
        message.readers.add(from_user)
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

    elif action == "edit":
        from_user = get_user_model().objects.get(id=from_id)

        message = Message.objects.get(id=message_id)
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

    elif action == "delete":
        from_user = get_user_model().objects.get(id=from_id)

        message = Message.objects.get(id=message_id)
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
