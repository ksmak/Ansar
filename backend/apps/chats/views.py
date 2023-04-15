# Django
from django.contrib.auth import get_user_model

# DRF
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

# Project
from .models import Chat
from .serializers import (
    ChatSerializer,
    ChatCreateSerializer,
)


User = get_user_model()


class ChatViewSet(ReadOnlyModelViewSet):
    """ChatViewSet."""
    serializer_class = ChatSerializer
    perimission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(users__in=self.request.user.id)

    @action(
        methods=('POST',),
        detail=False,
    )
    def create(
        self,
        request: Request
    ) -> Response:

        serializer = ChatCreateSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            Response({
                'result': 'Error read data.'
            }, 401)

        data = serializer.data

        chat = Chat.objects.create(title=data['title'])
        chat.admins.set([request.user])
        chat.users.set(data['users'])
        chat.save()

        return Response({
            'result': 'Success',
            'chat': ChatSerializer(chat)
        }, 200)
