from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Category, Podcast, Episode, Playlist, Subscription


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Podcast)
class PodcastAdmin(ModelAdmin):
    list_display = ['title', 'creator', 'category', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['title', 'description', 'creator__username']
    
    compressed_fields = True
    warn_unsaved_form = True
    
    fieldsets = (
        ("Basic Information", {
            "fields": ("title", "description", "category"),
        }),
        ("Media", {
            "fields": ("cover_image",),
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.creator = request.user
        super().save_model(request, obj, form, change)


@admin.register(Episode)
class EpisodeAdmin(ModelAdmin):
    list_display = ['title', 'podcast', 'duration', 'created_at']
    list_filter = ['podcast', 'created_at']
    search_fields = ['title', 'description', 'podcast__title']
    
    compressed_fields = True
    warn_unsaved_form = True
    
    fieldsets = (
        ("Episode Details", {
            "fields": ("title", "description", "podcast"),
        }),
        ("Media & Duration", {
            "fields": ("audio_file", "duration"),
        }),
    )


@admin.register(Playlist)
class PlaylistAdmin(ModelAdmin):
    list_display = ['name', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'user__username']
    filter_horizontal = ['episodes']
    
    compressed_fields = True
    warn_unsaved_form = True


@admin.register(Subscription)
class SubscriptionAdmin(ModelAdmin):
    list_display = ['user', 'podcast', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'podcast__title']
    
    compressed_fields = True
    warn_unsaved_form = True
