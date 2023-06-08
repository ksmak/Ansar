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
        if self.last_name or self.first_name:
            return f"{self.last_name} {self.first_name}".strip()
        else:
            return self.username
