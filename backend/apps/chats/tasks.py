from celery import shared_task

from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync

from channels.layers import get_channel_layer

from .models import Chat


User = get_user_model()


channel_layer = get_channel_layer()
