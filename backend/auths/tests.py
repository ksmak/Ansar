# Django
from django.test import TestCase

# Project
from .models import CustomUser, CustomGroup


class CustomUserTestCase(TestCase):
    """CustomUser test case."""
    def setUp(self) -> None:
        self.group = CustomGroup.objects.create(
            title="TestGroup1"
        )

        self.user = CustomUser.objects.create(
            username="test1",
            password="12345",
            email="test1@mail.ru",
            first_name="FirstName",
            last_name="LastName",
            group=self.group,
            is_active=True
        )

    def test_full_name(self):
        self.assertEqual(self.user.full_name, "LastName FirstName TestGroup1")
