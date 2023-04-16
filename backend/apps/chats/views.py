# DRF
from rest_framework.viewsets import ViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# Project
from .models import Chat
from .serializers import (
    ChatSerializer,
    ChatCreateSerializer,
)


class ChatViewSet(ViewSet):
    """ChatViewSet."""

    perimission_classes = [IsAuthenticated]

    def list(self, request):
        queryset = Chat.objects.filter(users__in=self.request.user.id)
        serializer = ChatSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = ChatCreateSerializer(
            data=request.data
        )

        data = serializer.data

        chat = Chat.objects.create(title=data['title'])
        chat.admins.set([request.user])
        chat.users.set(data['users'])
        chat.save()

        return Response(data)
