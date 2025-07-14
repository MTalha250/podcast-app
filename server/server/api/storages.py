from cloudinary_storage.storage import MediaCloudinaryStorage
import os


class AudioCloudinaryStorage(MediaCloudinaryStorage):
    """
    Custom Cloudinary storage for audio files.
    This ensures audio files are uploaded with the correct resource_type.
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set default options for audio files
        self.options = {
            'resource_type': 'raw',   # Store audio files as raw (no processing)
            'folder': 'episodes',     # Store audio files in episodes folder
            'use_filename': True,     # Preserve original filename
            'unique_filename': True,  # Add unique identifier to prevent conflicts
            'overwrite': False,       # Don't overwrite existing files
        }
    
    def _save(self, name, content):
        """Override the save method to ensure proper options for audio files"""
        # Detect if file is audio based on extension
        name_lower = name.lower()
        audio_extensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.wma']
        
        if any(name_lower.endswith(ext) for ext in audio_extensions):
            # For audio files, ensure we use the correct resource type
            original_options = self.options.copy()
            self.options.update({
                'resource_type': 'raw',  # Store audio as raw files
                'folder': 'episodes',
            })
            
            try:
                result = super()._save(name, content)
                return result
            finally:
                # Restore original options
                self.options = original_options
        else:
            # For non-audio files, use default behavior
            return super()._save(name, content)
    
    def url(self, name):
        """Override URL generation for audio files"""
        return super().url(name) 