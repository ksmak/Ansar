# Django
from django.contrib import admin

# Project
from .models import Chat, Message, Journal


admin.site.register(Chat)
admin.site.register(Message)
admin.site.register(Journal)
