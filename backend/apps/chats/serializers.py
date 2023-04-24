# DRF
from rest_framework import serializers

# Project
from .models import Message, Chat, Reader


class ReaderSerializer(serializers.ModelSerializer):
    """Reader serializer model."""
    class Meta:
        model = Reader
        fields = (
            'id',
            'message',
            'user',
            'read_date'
        )


class MessageSerializer(serializers.ModelSerializer):
    """Message serializer model."""
    readers = ReaderSerializer(many=True)

    class Meta:
        model = Message
        fields = (
            'id',
            'user',
            'chat',
            'from_user',
            'text',
            'file',
            'creation_date',
            'readers',
        )


class ChatSerializer(serializers.ModelSerializer):
    """Chat serializer model."""
    messages = MessageSerializer(source='chat_messages', many=True)

    class Meta:
        model = Chat

        fields = (
            'id',
            'title',
            'admins',
            'users',
            'actives',
            'creation_date',
            'messages'
        )


class ChatCreateSerializer(serializers.Serializer):
    """Serializer for create Chat."""
    id = serializers.ReadOnlyField()
    title = serializers.CharField(required=False)
    users = serializers.ListField(
        child=serializers.IntegerField()
    )
