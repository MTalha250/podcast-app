from django.contrib import admin
from django import forms
from unfold.admin import ModelAdmin
from .models import Category, Podcast, Episode, Playlist, Subscription


class EpisodeAdminForm(forms.ModelForm):
    audio_file_url = forms.URLField(
        required=False,
        help_text="For large audio files (>4MB), upload directly to Cloudinary and paste the URL here. "
                  "Leave empty if uploading a small file below.",
        widget=forms.URLInput(attrs={
            'placeholder': 'https://res.cloudinary.com/your-cloud/video/upload/...',
            'class': 'vTextField'
        })
    )
    
    class Meta:
        model = Episode
        fields = '__all__'
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['audio_file'].help_text = (
            "Upload small audio files (<4MB) here. For larger files, use the Cloudinary URL field below."
        )
        self.fields['audio_file'].required = False
    
    def clean(self):
        cleaned_data = super().clean()
        audio_file = cleaned_data.get('audio_file')
        audio_file_url = cleaned_data.get('audio_file_url')
        
        if not audio_file and not audio_file_url:
            raise forms.ValidationError(
                "Please either upload an audio file or provide a Cloudinary URL."
            )
        
        if audio_file and audio_file_url:
            raise forms.ValidationError(
                "Please use either file upload OR Cloudinary URL, not both."
            )
        
        return cleaned_data
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        
        # If using Cloudinary URL, set it as the audio_file
        if self.cleaned_data.get('audio_file_url') and not self.cleaned_data.get('audio_file'):
            instance.audio_file = self.cleaned_data['audio_file_url']
        
        if commit:
            instance.save()
        return instance


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
    form = EpisodeAdminForm
    list_display = ['title', 'podcast', 'duration', 'created_at']
    list_filter = ['podcast', 'created_at']
    search_fields = ['title', 'description', 'podcast__title']
    
    compressed_fields = True
    warn_unsaved_form = True
    
    fieldsets = (
        ("Episode Details", {
            "fields": ("title", "description", "podcast", "duration"),
        }),
        ("Audio File", {
            "fields": ("audio_file", "audio_file_url"),
            "description": "For large audio files (>4MB), upload directly to Cloudinary first, then paste the URL. "
                          "For smaller files, use the file upload field."
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
