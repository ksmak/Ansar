# Django
from django.contrib.auth import get_user_model
from django.conf import settings

# DRF
from rest_framework import viewsets
from rest_framework.request import Request
from rest_framework.response import Response

# Project
from chat.models import Room
from chat.serializers import (
    RoomSerializer,
)


User = get_user_model()


class RoomViewSet(viewsets.ViewSet):
    """Viewset for rooms"""
    def list(self, request: Request) -> Response:
        public_user, created = User.objects.public_user()
        params: list[str] = [str(public_user.id)]
        params.append(request.query_params.get('user'))
        queryset = Room.objects.filter(users__in=params)
        serializer = RoomSerializer(queryset, many=True)

        return Response(data=serializer.data)
