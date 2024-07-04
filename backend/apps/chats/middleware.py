# Python
from urllib.parse import parse_qs
from jwt import decode as jwt_decode

# Django
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.conf import settings

# Channels
from channels.db import database_sync_to_async


User = get_user_model()


@database_sync_to_async
def get_user(token_string):
    try:
        decoded_data = jwt_decode(
            token_string,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        user = User.objects.get(id=decoded_data["user_id"])
    except Exception:
        user = AnonymousUser()

    return user


class TokenAuthMiddleWare:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope["query_string"]
        query_params = query_string.decode("utf-8")
        query_dict = parse_qs(query_params)
        token = query_dict["token"][0]
        user = await get_user(token)
        scope["user"] = user
        return await self.app(scope, receive, send)
