from django.shortcuts import render
from rest_framework import generics, viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Category, Podcast, Episode, Playlist, Subscription
from .serializers import (
    CategorySerializer,
    UserSerializer,
    PodcastSerializer,
    PodcastListSerializer,
    EpisodeSerializer,
    EpisodeListSerializer,
    PlaylistSerializer,
    PlaylistCreateSerializer,
    SubscriptionSerializer,
    UserRegistrationSerializer
)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
    
        token['username'] = user.username
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
        }
        
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        tokens = get_tokens_for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': tokens['refresh'],
            'access': tokens['access'],
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'})
        else:
            return Response({'error': 'Refresh token required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': 'Error logging out'}, 
                      status=status.HTTP_400_BAD_REQUEST)


class CategoryListView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class PodcastViewSet(viewsets.ModelViewSet):
    queryset = Podcast.objects.all().select_related('creator', 'category')
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PodcastListSerializer
        return PodcastSerializer
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        creator = self.request.query_params.get('creator')
        if creator:
            queryset = queryset.filter(creator=creator)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)
        
        return queryset
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_podcasts(self, request):
        podcasts = self.get_queryset().filter(creator=request.user)
        serializer = self.get_serializer(podcasts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def subscribe(self, request, pk=None):
        podcast = self.get_object()
        subscription, created = Subscription.objects.get_or_create(
            user=request.user,
            podcast=podcast
        )
        
        if created:
            return Response({'message': 'Successfully subscribed to podcast'})
        else:
            return Response({'message': 'Already subscribed to this podcast'})
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def unsubscribe(self, request, pk=None):
        podcast = self.get_object()
        try:
            subscription = Subscription.objects.get(user=request.user, podcast=podcast)
            subscription.delete()
            return Response({'message': 'Successfully unsubscribed'})
        except Subscription.DoesNotExist:
            return Response({'message': 'Not subscribed to this podcast'}, 
                          status=status.HTTP_400_BAD_REQUEST)


class EpisodeViewSet(viewsets.ModelViewSet):
    queryset = Episode.objects.all().select_related('podcast__creator')
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EpisodeListSerializer
        return EpisodeSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        podcast = self.request.query_params.get('podcast')
        if podcast:
            queryset = queryset.filter(podcast=podcast)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        episodes = self.get_queryset()[:10]
        serializer = EpisodeListSerializer(episodes, many=True)
        return Response(serializer.data)


class PlaylistViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Playlist.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PlaylistCreateSerializer
        return PlaylistSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_episode(self, request, pk=None):
        playlist = self.get_object()
        episode_id = request.data.get('episode_id')
        
        if not episode_id:
            return Response({'error': 'episode_id is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            episode = Episode.objects.get(id=episode_id)
            playlist.episodes.add(episode)
            return Response({'message': 'Episode added to playlist'})
        except Episode.DoesNotExist:
            return Response({'error': 'Episode not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['delete'])
    def remove_episode(self, request, pk=None):
        playlist = self.get_object()
        episode_id = request.data.get('episode_id')
        
        if not episode_id:
            return Response({'error': 'episode_id is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            episode = Episode.objects.get(id=episode_id)
            playlist.episodes.remove(episode)
            return Response({'message': 'Episode removed from playlist'})
        except Episode.DoesNotExist:
            return Response({'error': 'Episode not found'}, 
                          status=status.HTTP_404_NOT_FOUND)


class SubscriptionListView(generics.ListAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user).select_related('podcast')


@api_view(['GET'])
@permission_classes([AllowAny])
def search(request):
    query = request.query_params.get('q', '')
    
    if not query:
        return Response({'error': 'Search query (q) parameter is required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    podcasts = Podcast.objects.filter(title__icontains=query)[:5]
    podcast_data = PodcastListSerializer(podcasts, many=True).data
    episodes = Episode.objects.filter(title__icontains=query)[:5]
    episode_data = EpisodeListSerializer(episodes, many=True).data
    
    return Response({
        'podcasts': podcast_data,
        'episodes': episode_data
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def trending(request):
    podcasts = Podcast.objects.all().order_by('-created_at')[:10]
    serializer = PodcastListSerializer(podcasts, many=True)
    return Response(serializer.data)


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    user = request.user
    
    stats = {
        'podcasts_created': Podcast.objects.filter(creator=user).count(),
        'playlists_created': Playlist.objects.filter(user=user).count(),
        'subscriptions': Subscription.objects.filter(user=user).count(),
    }
    
    return Response(stats)


