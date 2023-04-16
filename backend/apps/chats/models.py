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
    create_date = models.DateTimeField(
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
    STATUS_CREATE = 0
    STATUS_SENT = 1
    STATUS_DELIVERED = 2
    STATUS_READ = 3
    STATUS_DELETED = 4

    STATUSES = (
        (STATUS_CREATE, 'создан'),
        (STATUS_SENT, 'отправлен'),
        (STATUS_DELIVERED, 'доставлен'),
        (STATUS_READ, 'прочитан'),
        (STATUS_DELETED, 'удален'),
    )

    status = models.PositiveSmallIntegerField(
        verbose_name='статус',
        choices=STATUSES,
        default=STATUS_CREATE
    )
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
    delivery_date = models.DateTimeField(
        verbose_name='дата доставки',
        null=True,
        blank=True
    )
    reading_date = models.DateTimeField(
        verbose_name='дата прочтения',
        null=True,
        blank=True
    )
    deletion_date = models.DateTimeField(
        verbose_name='дата удаления',
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = 'сообщение'
        verbose_name_plural = 'сообщения'
        ordering = ('-creation_date', )

    def __str__(self) -> str:
        return f"Message from {self.from_user} {self.creation_date}: {self.text}" # noqa
