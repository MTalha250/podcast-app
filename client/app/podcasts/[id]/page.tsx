"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Play,
  Heart,
  Share2,
  Download,
  Calendar,
  User,
  Tag,
  Clock,
  ArrowLeft,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import EpisodeCard from "@/components/EpisodeCard";
import PodcastCard from "@/components/PodcastCard";
import { Podcast, Episode, EpisodeList, PodcastList } from "@/types";
import {
  podcastsAPI,
  episodesAPI,
  searchAPI,
  subscriptionsAPI,
} from "@/lib/api";
import useAuthStore from "@/store/authStore";

export default function PodcastDetailPage() {
  const params = useParams();
  const router = useRouter();
  const podcastId = parseInt(params.id as string);

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeList[]>([]);
  const [relatedPodcasts, setRelatedPodcasts] = useState<PodcastList[]>([]);
  const [loading, setLoading] = useState({
    podcast: true,
    episodes: true,
    related: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (podcastId) {
      loadPodcastData();
    }
  }, [podcastId]);

  // Check subscription status when component mounts or auth status changes
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!isAuthenticated) {
        setIsSubscribed(false);
        return;
      }

      try {
        const subscriptions = await subscriptionsAPI.getAll();
        const isUserSubscribed = subscriptions.some(
          (sub) => sub.podcast === podcastId
        );
        setIsSubscribed(isUserSubscribed);
      } catch (error) {
        console.error("Error checking subscription status:", error);
        setIsSubscribed(false);
      }
    };

    checkSubscriptionStatus();
  }, [isAuthenticated, podcastId]);

  const loadPodcastData = async () => {
    try {
      setLoading({ podcast: true, episodes: true, related: true });

      // Load podcast details and episodes
      const [podcastRes, episodesRes] = await Promise.all([
        podcastsAPI.getById(podcastId),
        episodesAPI.getPodcastEpisodes(podcastId),
      ]);

      setPodcast(podcastRes);

      if (Array.isArray(episodesRes)) {
        setEpisodes(episodesRes);
      }

      // Load related podcasts (same category)
      try {
        const relatedRes = await searchAPI.getTrending();
        if (Array.isArray(relatedRes)) {
          const related = relatedRes
            .filter(
              (p) =>
                p.id !== podcastId &&
                p.category_name === podcastRes.category_name
            )
            .slice(0, 6);
          setRelatedPodcasts(related);
        }
      } catch (err) {
        console.error("Error loading related podcasts:", err);
      }

      setError(null);
    } catch (err) {
      console.error("Error loading podcast:", err);
      setError("Failed to load podcast details. Please try again.");
    } finally {
      setLoading({ podcast: false, episodes: false, related: false });
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    setIsSubscribing(true);
    try {
      if (isSubscribed) {
        await podcastsAPI.unsubscribe(podcastId);
        setIsSubscribed(false);
      } else {
        await podcastsAPI.subscribe(podcastId);
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error("Subscribe error:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && podcast) {
      navigator.share({
        title: podcast.title,
        text: `Check out "${podcast.title}" podcast`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Podcast Not Found
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => router.back()}>Go Back</Button>
            <Button variant="outline" onClick={loadPodcastData}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading.podcast) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="bg-white rounded-lg p-8 mb-8">
              <div className="flex items-start space-x-8">
                <div className="w-64 h-64 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex space-x-4 mb-4">
                    <div className="h-10 w-24 bg-gray-200 rounded"></div>
                    <div className="h-10 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Episodes skeleton */}
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!podcast) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 p-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Podcast Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Cover Image */}
            <div className="flex-shrink-0">
              <div className="w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                {podcast.cover_image ? (
                  <img
                    src={podcast.cover_image}
                    alt={podcast.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Music className="h-24 w-24 text-white" />
                )}
              </div>
            </div>

            {/* Podcast Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {podcast.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>by {podcast.creator_name}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Tag className="h-4 w-4" />
                  <span>{podcast.category_name}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(podcast.created_at)}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{episodes.length} episodes</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className="flex items-center space-x-2"
                >
                  <Heart
                    className={`h-4 w-4 ${isSubscribed ? "fill-current" : ""}`}
                  />
                  <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex items-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>

              {/* Description */}
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {podcast.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Episodes ({episodes.length})
            </h2>
          </div>

          {loading.episodes ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : episodes.length > 0 ? (
            <div className="space-y-4">
              {episodes.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  showPodcastInfo={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No episodes yet
              </h3>
              <p className="text-gray-600">
                This podcast hasn't published any episodes yet. Check back
                later!
              </p>
            </div>
          )}
        </div>

        {/* Related Podcasts */}
        {relatedPodcasts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              More in {podcast.category_name}
            </h2>

            {loading.related ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg p-6 animate-pulse"
                  >
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPodcasts.map((relatedPodcast) => (
                  <PodcastCard
                    key={relatedPodcast.id}
                    podcast={relatedPodcast}
                    showSubscribeButton={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
