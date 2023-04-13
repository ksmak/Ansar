# Django
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

# Project
from .models import CustomUser


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


admin.site.register(CustomUser, CustomUserAdmin)
