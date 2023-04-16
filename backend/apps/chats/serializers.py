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
            'status',
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
