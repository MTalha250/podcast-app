from django.db import models
from django.contrib.auth.models import User
from .fields import AudioFileField

# Create your models here.

class Category(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"

class Podcast(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    cover_image = models.ImageField(upload_to='podcasts/', blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    

    
    def __str__(self):
        return self.title

class Episode(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    audio_file = AudioFileField(upload_to='episodes/')
    podcast = models.ForeignKey(Podcast, on_delete=models.CASCADE)
    duration = models.IntegerField(help_text="Duration in minutes")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # If this is a new upload, ensure it goes to Cloudinary with correct resource type
        if self.pk is None and self.audio_file:
            try:
                # Check if it's an audio file
                file_name = self.audio_file.name
                file_ext = file_name.lower().split('.')[-1] if '.' in file_name else ''
                audio_extensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma']
                
                if file_ext in audio_extensions:
                    import cloudinary.uploader
                    
                    # Upload directly to Cloudinary with raw resource type
                    result = cloudinary.uploader.upload(
                        self.audio_file.file,
                        folder="episodes",
                        resource_type="raw",
                        use_filename=True,
                        unique_filename=True,
                        overwrite=False
                    )
                    
                    # Store the public_id instead of the file
                    self.audio_file.name = result.get('public_id')
            except Exception as e:
                # If direct upload fails, proceed with normal save
                pass
        
        super().save(*args, **kwargs)
    
    @property
    def audio_file_url(self):
        """Get the correct URL for the audio file"""
        if self.audio_file and self.audio_file.name:
            # Check if this is an audio file
            file_name = str(self.audio_file.name)
            file_ext = file_name.lower().split('.')[-1] if '.' in file_name else ''
            audio_extensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma']
            
            if file_ext in audio_extensions:
                # Return raw URL for audio files
                import cloudinary
                cloud_name = cloudinary.config().cloud_name
                return f"https://res.cloudinary.com/{cloud_name}/raw/upload/v1/{file_name}"
            else:
                return self.audio_file.url
        return None
    
    def __str__(self):
        return self.title

class Playlist(models.Model):
    name = models.CharField(max_length=200)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    episodes = models.ManyToManyField(Episode, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    podcast = models.ForeignKey(Podcast, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'podcast']
    
    def __str__(self):
        return f"{self.user.username} follows {self.podcast.title}"
