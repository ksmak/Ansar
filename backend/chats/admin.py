# Django
from django.contrib import admin

# Project
from .models import Chat, Message


admin.site.register(Chat)
admin.site.register(Message)
