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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-card/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Podcast Not Found
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <div className="space-x-4">
            <Button
              onClick={() => router.back()}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 border-0"
            >
              Go Back
            </Button>
            <Button
              onClick={loadPodcastData}
              className="bg-card/50 border-white/20 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-white/40"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading.podcast) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="bg-card/50 border-white/10 rounded-lg p-8 mb-8">
              <div className="flex items-start space-x-8">
                <div className="w-64 h-64 bg-white/5 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-8 bg-white/10 rounded mb-4"></div>
                  <div className="h-4 bg-white/5 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-white/5 rounded w-1/2 mb-4"></div>
                  <div className="flex space-x-4 mb-4">
                    <div className="h-10 w-24 bg-white/10 rounded"></div>
                    <div className="h-10 w-20 bg-white/5 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Episodes skeleton */}
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card/50 border-white/10 rounded-lg p-6"
                >
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-2/3"></div>
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          onClick={() => router.back()}
          variant="ghost"
          size="sm"
          className="mb-6 text-muted-foreground hover:text-foreground hover:bg-card/50 flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>

        {/* Podcast Header */}
        <div className="bg-card/50 border-white/10 rounded-lg p-8 mb-8">
          <div className="flex items-start space-x-8">
            {/* Podcast Cover */}
            <div className="w-64 h-64 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
              {podcast?.cover_image ? (
                <img
                  src={podcast.cover_image}
                  alt={podcast.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Podcast Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                {podcast?.title}
              </h1>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>by {podcast?.creator_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>{podcast?.category_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(podcast?.created_at || "")}</span>
                </div>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {podcast?.description}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className={
                    isSubscribed
                      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/30 border-0 flex items-center space-x-2"
                      : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 border-0 flex items-center space-x-2"
                  }
                >
                  <Heart
                    className={`h-4 w-4 ${isSubscribed ? "fill-current" : ""}`}
                  />
                  <span>
                    {isSubscribing
                      ? isSubscribed
                        ? "Unsubscribing..."
                        : "Subscribing..."
                      : isSubscribed
                      ? "Unsubscribe"
                      : "Subscribe"}
                  </span>
                </Button>

                <Button
                  onClick={handleShare}
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground hover:bg-card/50 flex items-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Episodes</h2>
            {episodes.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Music className="h-4 w-4" />
                <span>{episodes.length} episodes</span>
              </div>
            )}
          </div>

          {loading.episodes ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card/50 border-white/10 rounded-lg p-6 animate-pulse"
                >
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-1/3"></div>
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
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-card/50 border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No episodes yet
              </h3>
              <p className="text-muted-foreground">
                This podcast hasn't released any episodes yet. Check back later!
              </p>
            </div>
          )}
        </div>

        {/* Related Podcasts */}
        {relatedPodcasts.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              More in {podcast?.category_name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPodcasts.map((relatedPodcast) => (
                <PodcastCard key={relatedPodcast.id} podcast={relatedPodcast} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
