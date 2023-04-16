# Django
from django.db import models
from django.contrib.auth import get_user_model


User = get_user_model()


class Chat(models.Model):
    """Chat model."""
    title = models.CharField(
        verbose_name='название',
        max_length=150,
        null=True,
        blank=True
    )
    admins = models.ManyToManyField(
        verbose_name='администраторы',
        to=User,
        related_name='admins'
    )
    users = models.ManyToManyField(
        verbose_name='пользователи',
        to=User,
        related_name='users'
    )
    actives = models.ManyToManyField(
        verbose_name='активные пользователи',
        to=User,
        related_name='actives'
    )
    creation_date = models.DateTimeField(
        verbose_name='дата создания',
        auto_now_add=True
    )

    class Meta:
        verbose_name = 'чат'
        verbose_name_plural = 'чаты'

    def __str__(self) -> str:
        return f"Chat: {self.title}"


class Message(models.Model):
    """Message model."""
    chat = models.ForeignKey(
        verbose_name='чат',
        to=Chat,
        on_delete=models.CASCADE,
        related_name='chat'
    )
    from_user = models.ForeignKey(
        verbose_name='отправитель',
        to=User,
        on_delete=models.CASCADE,
        related_name='from_user'
    )
    text = models.TextField(
        verbose_name='текст сообщения',
        null=True,
        blank=True
    )
    file = models.FileField(
        verbose_name='вложенный файл',
        upload_to='uploads/',
        null=True,
        blank=True
    )
    creation_date = models.DateTimeField(
        verbose_name='дата создания',
        auto_now_add=True
    )

    class Meta:
        verbose_name = 'сообщение'
        verbose_name_plural = 'сообщения'
        ordering = ('-creation_date', )

    def __str__(self) -> str:
        return f"Message from {self.from_user} {self.creation_date}: {self.text}" # noqa
