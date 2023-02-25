# Django
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    """Custom user model."""
    class Meta:
        ordering = ('username', )
        verbose_name = 'пользователь'
        verbose_name_plural = 'пользователи'

    def __str__(self) -> str:
        return self.username

    @property
    def full_name(self):
        return f"{self.last_name} {self.first_name}"
