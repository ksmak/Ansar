# Django
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# DRF
from rest_framework import routers
from rest_framework_simplejwt import views as jwt_views

# Project
from chats.views import ChatViewSet
from auths.views import UsersViewSet


router = routers.DefaultRouter()
router.register(r'chats', ChatViewSet, basename='rooms')
router.register(r'users', UsersViewSet, basename='users')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', jwt_views.TokenObtainPairView.as_view()),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view()),
    path('api/', include(router.urls)),
]


urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


if settings.DEBUG:
    urlpatterns += [
        path('__debug__/', include('debug_toolbar.urls')),
    ]
