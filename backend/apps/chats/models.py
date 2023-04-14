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
    users = models.ManyToManyField(
        verbose_name='пользователи',
        to=User,
        related_name='users'
    )
    create_date = models.DateTimeField(
        verbose_name='дата создания',
        auto_now_add=True
    )

    class Meta:
        verbose_name = 'чат'
        verbose_name_plural = 'чаты'

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
        return f"{self.from_user}/{self.chat}({self.create_date}"
