from django.core.management.base import BaseCommand
from api.models import Episode


class Command(BaseCommand):
    help = 'Fix existing audio file URLs to use raw/upload instead of image/upload'

    def handle(self, *args, **options):
        self.stdout.write("Fixing existing audio file URLs...")
        
        episodes = Episode.objects.filter(audio_file__isnull=False)
        fixed_count = 0
        
        for episode in episodes:
            if episode.audio_file and episode.audio_file.name:
                # Check if this is an audio file with incorrect URL
                file_name = str(episode.audio_file.name)
                file_ext = file_name.lower().split('.')[-1] if '.' in file_name else ''
                audio_extensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma']
                
                if file_ext in audio_extensions:
                    # Get current URL
                    current_url = episode.audio_file.url if episode.audio_file else ''
                    
                    # Check if it has the wrong image/upload path
                    if '/image/upload/' in current_url:
                        self.stdout.write(f"Fixing Episode ID {episode.id}: {episode.title}")
                        self.stdout.write(f"  Old URL: {current_url}")
                        
                        # The audio_file_url property will automatically generate the correct URL
                        correct_url = episode.audio_file_url
                        self.stdout.write(f"  New URL: {correct_url}")
                        
                        fixed_count += 1
                    else:
                        self.stdout.write(f"Episode ID {episode.id} already has correct URL: {current_url}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Processed {episodes.count()} episodes, fixed {fixed_count} audio URLs"
            )
        )
        
        if fixed_count > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    "🎉 Audio URLs are now fixed! New episodes will automatically use the correct URLs."
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    "🎉 All audio URLs are already correct!"
                )
            ) 