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
    actives = models.ManyToManyField(
        verbose_name='активные пользователи',
        to=User,
        related_name='actives'
    )
    created_at = models.DateTimeField(
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
    STATE_ACTIVE = 1
    STATE_DELETE = 2
    STATES = (
     (STATE_ACTIVE, 'активный'),
     (STATE_DELETE, 'удален')   
    )
    state = models.PositiveSmallIntegerField(
        verbose_name='состояние',
        choices=STATES,
        default=STATE_ACTIVE
    )
    from_user = models.ForeignKey(
        verbose_name='отправитель',
        to=User,
        on_delete=models.CASCADE,
    )
    to_user = models.ForeignKey(
        verbose_name='получатель: пользователь',
        to=User,
        on_delete=models.CASCADE,
        related_name='to_user_messages',
        null=True,
        blank=True
    )
    to_chat = models.ForeignKey(
        verbose_name='получатель: чат',
        to=Chat,
        on_delete=models.CASCADE,
        related_name='chat_messages',
        null=True,
        blank=True
    )
    text = models.TextField(
        verbose_name='текст сообщения',
        null=True,
        blank=True
    )
    file = models.FileField(
        verbose_name='вложенный файл',
        upload_to='',
        null=True,
        blank=True
    )
    readers = models.ManyToManyField(
        to=User,
        through="Reader",
        related_name="read_messages"
    )
    created_at = models.DateTimeField(
        verbose_name='дата создания',
        auto_now_add=True
    )
    changed_at = models.DateTimeField(
        verbose_name='дата изменения',
        auto_now=True
    )
    deleted_at = models.DateTimeField(
        verbose_name='дата удаления',
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = 'сообщение'
        verbose_name_plural = 'сообщения'
        ordering = ('changed_at', )

    def __str__(self) -> str:
        return f"Message[{self.state} {self.from_user} {self.created_at} {self.changed_at} {self.deleted_at}]: {self.text}" # noqa


class Reader(models.Model):
    """Message readers."""
    message = models.ForeignKey(
        verbose_name="сообщение",
        to=Message,
        on_delete=models.CASCADE
    )
    user = models.ForeignKey(
        verbose_name="пользователь",
        to=User,
        on_delete=models.CASCADE
    )
    read_date = models.DateTimeField(
        verbose_name="дата прочтения сообщения",
        auto_now_add=True
    )

    class Meta:
        verbose_name = 'читатель'
        verbose_name_plural = 'читатели'
        ordering = ('-read_date', )

    def __str__(self) -> str:
        return f"User:{self.user.username}, message:{self.message}, read date:{self.read_date}" # noqa


class OnlineUser(models.Model):
    """Online users."""
    user = models.OneToOneField(
        verbose_name="пользователь",
        to=User,
        on_delete=models.CASCADE
    )
    is_active = models.BooleanField(
        verbose_name='активность',
        default=True
    )
    last_date = models.DateTimeField(
        verbose_name="дата последнего входа",
        auto_now=True
    )

    class Meta:
        verbose_name = 'онлайн пользователи'
        verbose_name_plural = 'онлайн пользователи'
        ordering = ('-last_date', )

    def __str__(self) -> str:
        return f"User:{self.user.username}, last date:{self.last_date}" # noqa
