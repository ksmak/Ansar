# DRF
from rest_framework import serializers

# Project
from .models import Message, Chat, Reader, OnlineUser
from auths.models import CustomUser


class ReaderSerializer(serializers.ModelSerializer):
    """Reader serializer model."""
    fullname = serializers.SerializerMethodField()
    
    class Meta:
        model = Reader
        fields = (
            'id',
            'user',
            'fullname',
            'read_date'
        )
    
    def get_fullname(self, obj):
        result = CustomUser.objects.get(id=obj.user.id)
        return result.full_name

class MessageSerializer(serializers.ModelSerializer):
    """Message serializer model."""
    readers = ReaderSerializer(many=True)
    fullname = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            'id',
            'state',
            'from_user',
            'to_user',
            'to_chat',
            'text',
            'file',
            'modified_date',
            'readers',
            'fullname',
        )
    
    def get_fullname(self, obj):
        result = CustomUser.objects.get(id=obj.from_user.id)
        return result.full_name


class ChatSerializer(serializers.ModelSerializer):
    """Chat serializer model."""
    # messages = MessageSerializer(source='chat_messages', many=True)
    messages = serializers.SerializerMethodField()

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

    def get_messages(self, obj):
        result = Message.objects.filter(state=Message.STATE_ACTIVE, to_chat=obj.id)
        serializer = MessageSerializer(result, many=True)
        return serializer.data


class ChatCreateSerializer(serializers.Serializer):
    """Serializer for create Chat."""
    id = serializers.ReadOnlyField()
    title = serializers.CharField(required=False)
    users = serializers.ListField(
        child=serializers.IntegerField()
    )


class OnlineUserSerializer(serializers.ModelSerializer):
    """Serializer for online users."""

    class Meta:
        model = OnlineUser
        fields = (
            'user',
            'is_active',
            'last_date'
        )