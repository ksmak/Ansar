# Django
from django.contrib.auth import get_user_model

# DRF
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
