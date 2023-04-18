# Django
from django.contrib.auth import get_user_model

# DRF
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


User = get_user_model()


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)
        return {
            "access": data["access"],
            "refresh": data["refresh"],
            "id": self.user.id,
            "full_name": self.user.full_name
        }


class CustomUserSerializer(serializers.ModelSerializer):
    """Custom user serializer."""
    class Meta:
        model = User
        fields = (
            'id', 'username', 'full_name', 'is_active'
        )
