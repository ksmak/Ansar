# Django
from django.core.files.storage import FileSystemStorage

# DRF
from rest_framework.views import APIView
from rest_framework.viewsets import ViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_202_ACCEPTED,
    HTTP_400_BAD_REQUEST,
)

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
        queryset = Chat.objects.filter(users__in=[self.request.user.id])
        serializer = ChatSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = ChatCreateSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            Response({
                'errors': serializer.errors
            }, HTTP_400_BAD_REQUEST)

        data = serializer.data

        chat = Chat.objects.create(title=data['title'])
        chat.admins.set([request.user])
        chat.users.set(data['users'])
        chat.save()

        return Response(ChatSerializer(chat).data, HTTP_200_OK)


class FileUploadView(APIView):
    """View for upload user's files."""
    def post(self, request):
        if not request.FILES and not request.FILES['file']:
            return Response({
                'error': 'File not found.'
            }, HTTP_400_BAD_REQUEST)

        file = request.FILES['file']
        fs = FileSystemStorage()
        filename = fs.save(file.name, file)
        file_url = fs.url(filename)

        return Response({
            'file_url': file_url
        }, HTTP_202_ACCEPTED)
