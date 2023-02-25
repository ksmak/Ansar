# DRF
from rest_framework import serializers

# Project
from .models import CustomUser


class CustomUserSerializer(serializers.ModelSerializer):
    """Custom user serializer."""

    class Meta:
        model = CustomUser

        fields = "__all__"
