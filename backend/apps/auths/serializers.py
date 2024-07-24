from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from chats.models import Message
from chats.serializers import MessageSerializer, OnlineUserSerializer


User = get_user_model()


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)

        token["user_id"] = user.id
        token["username"] = user.username
        token["full_name"] = user.full_name

        return token


class CustomUserSerializer(serializers.ModelSerializer):
    """Custom user serializer."""

    messages = serializers.SerializerMethodField()

    online = OnlineUserSerializer(source="onlineuser")

    class Meta:
        model = User
        fields = ("id", "username", "full_name", "is_active", "messages", "online")

    def get_messages(self, obj):
        result = Message.objects.filter(state=Message.STATE_ACTIVE).filter(
            Q(to_chat=None) & (Q(from_user=obj.id) | Q(to_user=obj.id))
        )

        serializer = MessageSerializer(result, many=True)

        return serializer.data
