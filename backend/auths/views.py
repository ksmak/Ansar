# DRF
from rest_framework.viewsets import ReadOnlyModelViewSet

# Project
from .models import CustomUser
from .serializers import CustomUserSerializer


class UsersViewSet(ReadOnlyModelViewSet):
    """Users viewset."""
    queryset = CustomUser.objects.exclude(is_superuser=True)
    serializer_class = CustomUserSerializer
