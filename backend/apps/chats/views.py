# Django
from django.contrib.auth import get_user_model

# DRF
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated

# Project
from .models import Chat
from .serializers import ChatSerializer


User = get_user_model()


class ChatViewSet(ModelViewSet):
    """ChatViewSet."""
    serializer_class = ChatSerializer
    perimission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(users__in=self.request.user.id)
