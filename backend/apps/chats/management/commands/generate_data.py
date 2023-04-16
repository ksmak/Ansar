# Python
import random
from typing import Any

# Django
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

# Third party
import names


User = get_user_model()


class Command(BaseCommand):
    """Custom command for filling up database."""

    help = 'Custom command for filling up database.'

    def generate_users(self, count: int) -> list[User]:
        user_names = []
        while len(user_names) < count:
            user_name = names.get_first_name()
            if user_name not in user_names:
                user_names.append(user_name)

        email_domens = ['@gmail.com', '@mail.ru', '@yandex.ru']

        users = []
        for user_name in user_names:
            user, create = User.objects.get_or_create(
                username=user_name
            )
            user.first_name = names.get_first_name()
            user.last_name = names.get_last_name()
            user.email = user.first_name.lower() + random.choice(email_domens)
            user.set_password('12345')
            user.save()
            users.append(user)

        return users

    def handle(self, *args: Any, **kwargs: Any) -> None:
        """Handles data filling."""
        self.generate_users(100)
