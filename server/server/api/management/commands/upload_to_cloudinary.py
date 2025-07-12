from django.core.management.base import BaseCommand
from django.core.files import File
from api.models import Podcast, Episode
import os
import cloudinary
import cloudinary.uploader
from pathlib import Path

class Command(BaseCommand):
    help = 'Upload existing media files to Cloudinary'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without actually uploading files',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting Cloudinary upload process...'))
        
        # Check if Cloudinary is configured
        cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME')
        if not cloud_name:
            self.stdout.write(
                self.style.ERROR('Cloudinary not configured. Please set environment variables.')
            )
            return

        self.stdout.write(f'Using Cloudinary cloud: {cloud_name}')
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No files will be uploaded'))

        # Upload podcast cover images
        self.stdout.write('\n📸 Processing podcast cover images...')
        podcasts = Podcast.objects.filter(cover_image__isnull=False)
        
        for podcast in podcasts:
            if podcast.cover_image:
                file_path = podcast.cover_image.path if hasattr(podcast.cover_image, 'path') else None
                
                self.stdout.write(f'  📁 {podcast.title}: {podcast.cover_image.name}')
                
                if file_path and os.path.exists(file_path):
                    if not dry_run:
                        try:
                            # Upload to Cloudinary
                            response = cloudinary.uploader.upload(
                                file_path,
                                folder="podcasts",
                                public_id=f"podcast_{podcast.id}_{Path(file_path).stem}",
                                resource_type="image"
                            )
                            self.stdout.write(
                                self.style.SUCCESS(f'    ✅ Uploaded: {response["secure_url"]}')
                            )
                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(f'    ❌ Error: {str(e)}')
                            )
                    else:
                        self.stdout.write('    🔍 Would upload this file')
                else:
                    self.stdout.write(
                        self.style.WARNING(f'    ⚠️ File not found locally: {file_path}')
                    )

        # Upload episode audio files
        self.stdout.write('\n🎵 Processing episode audio files...')
        episodes = Episode.objects.filter(audio_file__isnull=False)
        
        for episode in episodes:
            if episode.audio_file:
                file_path = episode.audio_file.path if hasattr(episode.audio_file, 'path') else None
                
                self.stdout.write(f'  📁 {episode.title}: {episode.audio_file.name}')
                
                if file_path and os.path.exists(file_path):
                    if not dry_run:
                        try:
                            # Upload to Cloudinary
                            response = cloudinary.uploader.upload(
                                file_path,
                                folder="episodes",
                                public_id=f"episode_{episode.id}_{Path(file_path).stem}",
                                resource_type="auto"  # Auto-detect file type
                            )
                            self.stdout.write(
                                self.style.SUCCESS(f'    ✅ Uploaded: {response["secure_url"]}')
                            )
                        except Exception as e:
                            self.stdout.write(
                                self.style.ERROR(f'    ❌ Error: {str(e)}')
                            )
                    else:
                        self.stdout.write('    🔍 Would upload this file')
                else:
                    self.stdout.write(
                        self.style.WARNING(f'    ⚠️ File not found locally: {file_path}')
                    )

        self.stdout.write('\n' + '='*50)
        if dry_run:
            self.stdout.write(
                self.style.SUCCESS('DRY RUN completed. Run without --dry-run to upload files.')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('Upload process completed!')
            )
            self.stdout.write(
                'Note: You may need to update your model instances to use the new Cloudinary URLs.'
            ) 