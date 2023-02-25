# Django
from django.contrib import admin
from django.urls import path, include

# DRF
from rest_framework import routers
from rest_framework_simplejwt import views as jwt_views

# Project
from chat.views import (
    RoomViewSet,
    MessageViewSet
)
from auths.views import (
    UsersViewSet,
)


router = routers.DefaultRouter()
router.register(r'rooms', RoomViewSet, basename='rooms')
router.register(r'messages', MessageViewSet, basename='messages')
router.register(r'users', UsersViewSet, basename='users')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', jwt_views.TokenObtainPairView.as_view()),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view()),
    path('api/', include(router.urls)),
]
