# Django
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# DRF
from rest_framework import routers
from rest_framework_simplejwt import views as jwt_views

# Project
from chats.views import (
    ChatViewSet,
    FileUploadView,
)
from auths.views import (
    MyTokenObtainPairView,
    UsersViewSet,
    TestTokenView,
)


router = routers.DefaultRouter()
router.register(r'chats', ChatViewSet, basename='rooms')
router.register(r'users', UsersViewSet, basename='users')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', MyTokenObtainPairView.as_view()),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view()),
    path('api/', include(router.urls)),
    path('api/uploadfile/', FileUploadView.as_view()),
    path('api/test/', TestTokenView.as_view()),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
    urlpatterns += [
        path('__debug__/', include('debug_toolbar.urls')),
    ]
