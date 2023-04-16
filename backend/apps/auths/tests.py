# Django
from django.test import TestCase
from django.contrib.auth import get_user_model, authenticate


class SigninTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='testuser',
            password='Zz@12345',
            email='testuser@mail.ru'
        )
        self.first_name = 'FirstName'
        self.last_name = 'LastName'
        self.user.save()

    def tearDown(self):
        self.user.delete()

    def test_correct_user(self):
        user = authenticate(username='testuser', password='Zz@12345')
        self.assertTrue((user is not None) and user.is_authenticated)

    def test_wrong_username(self):
        user = authenticate(username='wronguser', password='Zz@12345')
        self.assertFalse((user is not None) and user.is_authenticated)

    def test_wrong_password(self):
        user = authenticate(username='testuser', password='wrongpass')
        self.assertFalse((user is not None) and user.is_authenticated)
