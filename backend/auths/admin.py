# Python
from typing import Any

# Django
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group
from django.conf import settings

# Project
from .models import CustomUser
from chat.models import Room


class CustomUserAdmin(UserAdmin):
    """CustomUser admin."""
    list_display = (
        'id',
        'username',
        'email',
        'first_name',
        'last_name',
        'is_active'
    )

    list_display_links = (
        'id',
        'username',
        'email',
        'first_name',
        'last_name',
        'is_active'
    )

    readonly_fields = (
        'id',
    )

    fieldsets = (
        ('Personal', {
            'classes': (
                'wide',
            ),
            'fields': (
                'id',
                'username',
                'password',
                'email',
                'first_name',
                'last_name',
            )
        }),
        ('Permissions', {
            'classes': (
                'wide',
            ),
            'fields': (
                'is_active',
                'is_staff',
                'is_superuser'
            )
        }),
    )

    add_fieldsets = (
        ('Personal', {
            'classes': (
                'wide',
            ),
            'fields': (
                'username',
                'email',
                'first_name',
                'last_name',
            )
        }),
        (None, {
            'classes': (
                'wide',
            ),
            'fields': (
                'password1',
                'password2'
            )
        })
    )

    search_fields = ('username', )
    ordering = ('username', )

    def save_model(
        self,
        request: Any,
        obj: CustomUser,
        form: Any,
        change: Any
    ) -> None:
        super().save_model(request, obj, form, change)
        if not change and obj.username != settings.PUBLIC_USER_NAME:
            public_user, created = CustomUser.objects.public_user()
            room = Room.objects.create(
                title=obj.full_name
            )
            room.users.add(public_user)
            room.users.add(obj)
            room.save()


admin.site.register(CustomUser, CustomUserAdmin)
admin.site.unregister(Group)
