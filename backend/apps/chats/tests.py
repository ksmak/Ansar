# Django
from django.test import TestCase
from django.contrib.auth import get_user_model

# DRF
from rest_framework.test import APIClient

# Project
from .models import Chat 

from unittest.mock import ANY


class ChatViewTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="testuser",
            password="Zz@12345",
            email="user@mail.ru"
        )
        self.user.save()

        self.seconduser = get_user_model().objects.create_user(
            username="testseconduser",
            password="Zz@12345",
            email="seconduser@mail.ru"
        )
        self.seconduser.save()

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def tearDown(self):
        self.client.force_authenticate(user=None)
        self.user.delete()

    def test_create_chat(self):
        request_data = {
            'title': 'test chat',
            'users': [self.seconduser.id],
        }
        expected_data = {
            'id': 1,
            'title': 'test chat',
            'admins': [self.user.id],
            'users': [self.seconduser.id],
            'actives': [],
            'create_date': ANY
        }
        response = self.client.post(
            path='/api/chats/',
            data=request_data,
            format='json'
        )
        assert response.status_code == 200
        self.assertDictEqual(expected_data, response.data)

    def test_list_chat(self):
        chat = Chat.objects.create(
            title='test chat'
        )
        chat.admins.set([self.user])
        chat.users.set([self.user, self.seconduser])
        chat.save()

        expected_data = [
            {
                'id': ANY,
                'title': 'test chat',
                'admins': [self.user.id],
                'users': [self.seconduser.id, self.user.id],
                'actives': [],
                'create_date': ANY
            }
        ]

        response = self.client.get('/api/chats/')
        assert response.status_code == 200
        self.assertListEqual(expected_data, response.data)
