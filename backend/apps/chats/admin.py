# Django
from django.contrib import admin

# Project
from .models import Chat, Message, Reader


admin.site.register(Chat)
admin.site.register(Message)
admin.site.register(Reader)
