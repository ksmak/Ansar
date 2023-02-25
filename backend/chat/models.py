# Django
from django.db import models

# Project
from auths.models import CustomUser


class Room(models.Model):
    """Room model."""
    title = models.CharField(
        verbose_name='название',
        max_length=150,
        null=True,
        blank=True
    )

    users = models.ManyToManyField(
        verbose_name='пользователи',
        to=CustomUser,
        related_name='users'
    )

    create_date = models.DateTimeField(
        verbose_name='дата создания',
        auto_now_add=True
    )

    class Meta:
        verbose_name = 'беседа'
        verbose_name_plural = 'беседы'
    
    def __str__(self) -> str:
        return self.title


class Message(models.Model):
    """Message model."""
    STATUS_NOT_SEND = 0
    STATUS_SEND = 1
    STATUS_NOT_READ = 2
    STATUS_READ = 3

    STATUSES = (
        (STATUS_NOT_SEND, 'не доставлен'),
        (STATUS_SEND, 'доставлен'),
        (STATUS_NOT_READ, 'не прочитан'),
        (STATUS_READ, 'прочитан'),
    )

    status = models.PositiveSmallIntegerField(
        verbose_name='статус',
        choices=STATUSES,
        default=STATUS_NOT_SEND
    )

    room = models.ForeignKey(
        verbose_name='беседа',
        to=Room,
        on_delete=models.CASCADE,
        related_name='room'
    )

    user = models.ForeignKey(
        verbose_name='пользователь',
        to=CustomUser,
        on_delete=models.CASCADE,
        related_name='user'
    )

    msg = models.TextField(
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

    create_date = models.DateTimeField(
        verbose_name='дата создания',
        auto_now_add=True
    )

    send_date = models.DateTimeField(
        verbose_name='дата доставки',
        null=True,
        blank=True
    )

    read_date = models.DateTimeField(
        verbose_name='дата прочтения',
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = 'сообщение'
        verbose_name_plural = 'сообщения'
        ordering = ('-create_date', )

    def __str__(self) -> str:
        return f"{self.user}/{self.room}({self.create_date}):{self.msg[:255]}"
