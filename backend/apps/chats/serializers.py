# DRF
from rest_framework import serializers

# Project
from .models import Message, Chat, Reader
from auths.models import CustomUser


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
    fullname = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            'id',
            'from_user',
            'to_user',
            'to_chat',
            'text',
            'file',
            'creation_date',
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
        result = Message.objects.filter(to_chat=obj.id)
        serializer = MessageSerializer(result, many=True)
        return serializer.data

class ChatCreateSerializer(serializers.Serializer):
    """Serializer for create Chat."""
    id = serializers.ReadOnlyField()
    title = serializers.CharField(required=False)
    users = serializers.ListField(
        child=serializers.IntegerField()
    )
