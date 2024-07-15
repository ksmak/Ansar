# Django
from django.contrib.auth import get_user_model
from django.db.models import Q

# DRF
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Project
from chats.models import Message
from chats.serializers import MessageSerializer, OnlineUserSerializer


User = get_user_model()


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)
        return {
            "access": data["access"],
            "refresh": data["refresh"],
            "id": self.user.id,
            "full_name": self.user.full_name,
            "username": self.user.username,
        }


class CustomUserSerializer(serializers.ModelSerializer):
    """Custom user serializer."""
    # messages = MessageSerializer(source="user_messages", many=True)
    messages = serializers.SerializerMethodField()
    online = OnlineUserSerializer(source="onlineuser")

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'full_name',
            'is_active',
            'messages',
            'online'
        )

    def get_messages(self, obj):
        result = Message.objects.filter(state=Message.STATE_ACTIVE).filter(Q(to_chat=None) & (Q(from_user=obj.id) | Q(to_user=obj.id)))
        serializer = MessageSerializer(result, many=True)
        return serializer.data
