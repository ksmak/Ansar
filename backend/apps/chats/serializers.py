# DRF
from rest_framework import serializers

# Project
from .models import Message, Chat, Journal


class JournalSerializer(serializers.ModelSerializer):
    """Journal serializer model."""
    class Meta:
        model = Journal
        fields = (
            'id',
            'action',
            'user_id',
            'message_id',
            'action_date'
        )


class MessageSerializer(serializers.ModelSerializer):
    """Message serializer model."""
    class Meta:
        model = Message
        fields = (
            'id',
            'chat',
            'from_user',
            'text',
            'file',
            'creation_date',
        )


class ChatSerializer(serializers.ModelSerializer):
    """Chat serializer model."""
    class Meta:
        model = Chat

        fields = (
            'id',
            'title',
            'admins',
            'users',
            'actives',
            'creation_date'
        )


class ChatCreateSerializer(serializers.Serializer):
    """Serializer for create Chat."""
    id = serializers.ReadOnlyField()
    title = serializers.CharField(required=False)
    users = serializers.ListField(
        child=serializers.IntegerField()
    )
