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
        related_name='user_messages',
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
    
    modified_date = models.DateTimeField(
        verbose_name='дата изменения',
        auto_now=True
    )

    class Meta:
        verbose_name = 'сообщение'
        verbose_name_plural = 'сообщения'
        ordering = ('modified_date', )

    def __str__(self) -> str:
        return f"Message[{self.from_user} {self.modified_date}]: {self.text}" # noqa


class Reader(models.Model):
    """Message readers."""
    message = models.ForeignKey(
        verbose_name="сообщение",
        to=Message,
        on_delete=models.CASCADE,
        related_name="readers"
    )
    user = models.ForeignKey(
        verbose_name="пользователь",
        to=User,
        on_delete=models.CASCADE,
        null=True,
        blank=True
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
