# DRF
from rest_framework import serializers

# Project
from .models import Message, Chat


class MessageSerializer(serializers.ModelSerializer):
    """Message serializer model."""
    class Meta:
        model = Message

        fields = (
            'id',
            'chat',
            'status',
            'from_user',
            'msg',
            'file',
            'create_date',
            'send_date',
            'read_date'
        )


class ChatSerializer(serializers.ModelSerializer):
    """Chat serializer model."""
    class Meta:
        model = Chat

        fields = (
            'id',
            'title',
            'create_date'
        )
