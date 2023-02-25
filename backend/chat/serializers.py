# DRF
from rest_framework import serializers

# Project
from .models import Message, Room


class MessageSerializer(serializers.ModelSerializer):
    """Message serializer model."""
    class Meta:
        model = Message

        fields = (
            'id',
            'room',
            'status',
            'user',
            'msg',
            'file',
            'create_date',
            'send_date',
            'read_date'
        )


class RoomSerializer(serializers.ModelSerializer):
    """Room serializer model."""
    class Meta:
        model = Room

        fields = (
            'id',
            'title',
            'create_date'
        )
