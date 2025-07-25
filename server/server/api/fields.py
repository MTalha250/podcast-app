from django.db import models
from cloudinary_storage.storage import MediaCloudinaryStorage
import cloudinary.uploader


class AudioCloudinaryStorage(MediaCloudinaryStorage):
    """Custom storage for audio files that uses raw resource type"""
    
    def _save(self, name, content):
        # Get file extension
        file_ext = name.lower().split('.')[-1] if '.' in name else ''
        audio_extensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma']
        
        if file_ext in audio_extensions:
            # For audio files, upload directly with raw resource type
            try:
                result = cloudinary.uploader.upload(
                    content,
                    folder="episodes",
                    resource_type="raw",
                    use_filename=True,
                    unique_filename=True,
                    overwrite=False
                )
                
                # Return the public_id which Cloudinary storage expects
                return result.get('public_id')
                
            except Exception as e:
                # Fall back to default behavior if direct upload fails
                pass
        
        # For non-audio files or if direct upload fails, use default behavior
        return super()._save(name, content)
    
    def url(self, name):
        """Override URL generation to use correct resource type for audio files"""
        if name:
            # Check if this is an audio file based on extension
            file_ext = name.lower().split('.')[-1] if '.' in name else ''
            audio_extensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma']
            
            if file_ext in audio_extensions:
                # Generate raw URL for audio files
                import cloudinary
                try:
                    return cloudinary.CloudinaryResource(name, resource_type="raw").build_url()
                except:
                    # If that fails, manually construct the URL
                    base_url = f"https://res.cloudinary.com/{cloudinary.config().cloud_name}/raw/upload"
                    return f"{base_url}/v1/{name}"
        
        # For non-audio files, use default URL generation
        return super().url(name)


class AudioFileField(models.FileField):
    """Custom FileField for audio files that uses AudioCloudinaryStorage"""
    
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('storage', AudioCloudinaryStorage())
        super().__init__(*args, **kwargs) 