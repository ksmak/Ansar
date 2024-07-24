from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework_simplejwt.views import TokenObtainPairView

# Project
from .serializers import (
    CustomUserSerializer,
    MyTokenObtainPairSerializer,
)


User = get_user_model()


class MyTokenObtainPairView(TokenObtainPairView):
    permission_classes = (AllowAny,)

    serializer_class = MyTokenObtainPairSerializer


class UsersViewSet(ReadOnlyModelViewSet):
    """Users viewset."""

    serializer_class = CustomUserSerializer

    def get_queryset(self):
        return User.objects.exclude(username=self.request.user.username)
