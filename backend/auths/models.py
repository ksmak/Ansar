# Django
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import UserManager
from django.conf import settings


class CustomUserManager(UserManager):
    """Custom user manager."""
    def public_user(self):
        return self.get_or_create(username=settings.PUBLIC_USER_NAME)


class CustomUser(AbstractUser):
    """Custom user model."""
    objects = CustomUserManager()
    class Meta:
        ordering = ('username', )
        verbose_name = 'пользователь'
        verbose_name_plural = 'пользователи'

    def __str__(self) -> str:
        return self.username

    @property
    def full_name(self):
        return f"{self.last_name} {self.first_name}"

