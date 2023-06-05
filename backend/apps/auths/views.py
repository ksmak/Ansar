# Django
from django.contrib.auth import get_user_model

# DRF
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework_simplejwt.views import TokenObtainPairView

# Project
from .serializers import (
    CustomUserSerializer,
    MyTokenObtainPairSerializer,
)


User = get_user_model()


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class UsersViewSet(ReadOnlyModelViewSet):
    """Users viewset."""
    queryset = User.objects.exclude(is_superuser=True)
    serializer_class = CustomUserSerializer


class TestTokenView(APIView):
    """Test token view."""

    parser_classes = [IsAuthenticated]

    def post(self, request):
        return Response({
            'result': 'success'
        })
