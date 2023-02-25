# Django
from django.shortcuts import render
from django.db.models import Model

# DRF
from rest_framework import (
    viewsets, 
    status
)
from rest_framework.request import Request
from rest_framework.response import Response

# Project
from chat.models import Room, Message
from chat.serializers import (
    RoomSerializer,
    MessageSerializer,
)


def index(request):
    return render(request, "chat/index.html")


def room(request, room_name):
    return render(request, "chat/room.html", {"room_name": room_name})




class RoomViewSet(viewsets.ViewSet):
    """Viewset for rooms"""
    def list(self, request: Request) -> Response:
        user: str = request.query_params.get('user')
        
        if user:
            queryset = Room.objects.filter(users__in=user)
        else:
            queryset = Room.objects.all()
        
        serializer = RoomSerializer(queryset, many=True)
        
        return Response(data=serializer.data)


class MessageViewSet(viewsets.ViewSet):
    """Viewset for messages."""
    def list(self, request: Request) -> Response:
        room: str = request.query_params.get('room')
        
        if room:
            queryset = Message.objects.filter(room__in=room)
        else:
            queryset = Message.objects.all()
        
        serializer = MessageSerializer(queryset, many=True)
        
        return Response(data=serializer.data)