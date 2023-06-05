# Django
from django.contrib.auth import get_user_model

# DRF
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Project
from chats.serializers import MessageSerializer


User = get_user_model()


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)
        return {
            "access": data["access"],
            "refresh": data["refresh"],
            "id": self.user.id,
            "full_name": self.user.full_name if self.user.full_name.strip() != "" else self.user.username # noqa
        }


class CustomUserSerializer(serializers.ModelSerializer):
    """Custom user serializer."""
    messages = MessageSerializer(source="user_messages", many=True)

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'full_name',
            'is_active',
            'messages'
        )
