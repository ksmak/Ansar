# Django
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group

# Project
from .models import (
    CustomUser,
)


class CustomGroupAdmin(admin.ModelAdmin):
    """Custom group admin."""
    list_display = (
        'id',
        'title'
    )

    list_display_links = (
        'id',
        'title'
    )

    readonly_fields = (
        'id',
    )

    fieldsets = (
        (None, {
            'classes': (
                'wide',
            ),
            'fields': (
                'id',
                'title'
            ),
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': (
                'wide',
            ),
            'fields': (
                'title',
            ),
        })
    )

    search_fields = ('title', )

    ordering = ('title', )


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
admin.site.unregister(Group)
