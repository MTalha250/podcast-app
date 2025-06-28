from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'podcasts', views.PodcastViewSet)
router.register(r'episodes', views.EpisodeViewSet)
router.register(r'playlists', views.PlaylistViewSet, basename='playlist')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', views.logout, name='logout'),
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('subscriptions/', views.SubscriptionListView.as_view(), name='subscription-list'),
    path('search/', views.search, name='search'),
    path('trending/', views.trending, name='trending'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('stats/', views.user_stats, name='user-stats'),
]