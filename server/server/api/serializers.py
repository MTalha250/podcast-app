from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Podcast, Episode, Playlist, Subscription


class CategorySerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Category
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class PodcastSerializer(serializers.ModelSerializer):
    
    creator_name = serializers.CharField(source='creator.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Podcast
        fields = [
            'id', 'title', 'description', 'cover_image', 
            'category', 'category_name', 'creator', 'creator_name', 
            'created_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at']


class EpisodeSerializer(serializers.ModelSerializer):
    
    podcast_title = serializers.CharField(source='podcast.title', read_only=True)
    audio_file_url = serializers.ReadOnlyField(source='audio_file_url')
    
    class Meta:
        model = Episode
        fields = [
            'id', 'title', 'description', 'audio_file', 'audio_file_url',
            'podcast', 'podcast_title', 'duration', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'audio_file_url']
    
    def to_representation(self, instance):
        """Override representation to use correct audio URL"""
        ret = super().to_representation(instance)
        try:
            # Replace audio_file with the correct URL if available
            audio_url = instance.audio_file_url
            if audio_url:
                ret['audio_file'] = audio_url
        except Exception:
            # If getting audio_file_url fails, keep the original value
            pass
        return ret
    
    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be greater than 0")
        return value


class PlaylistSerializer(serializers.ModelSerializer):
    
    episodes = EpisodeSerializer(many=True, read_only=True)
    episode_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Playlist
        fields = ['id', 'name', 'user', 'episodes', 'episode_count', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def get_episode_count(self, obj):
        return obj.episodes.count()


class PlaylistCreateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Playlist
        fields = ['id', 'name']
        read_only_fields = ['id']


class SubscriptionSerializer(serializers.ModelSerializer):
    
    user_name = serializers.CharField(source='user.username', read_only=True)
    podcast_title = serializers.CharField(source='podcast.title', read_only=True)
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'user', 'user_name', 'podcast', 'podcast_title', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']



class PodcastListSerializer(serializers.ModelSerializer):
    
    creator_name = serializers.CharField(source='creator.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Podcast
        fields = ['id', 'title', 'cover_image', 'creator_name', 'category_name', 'created_at']


class EpisodeListSerializer(serializers.ModelSerializer):
    
    podcast_title = serializers.CharField(source='podcast.title', read_only=True)
    
    class Meta:
        model = Episode
        fields = ['id', 'title', 'podcast_title', 'duration', 'created_at']


class UserRegistrationSerializer(serializers.ModelSerializer):  
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        user = User.objects.create_user(**validated_data)
        return user 