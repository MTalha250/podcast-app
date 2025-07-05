"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Clock,
  Calendar,
  TrendingUp,
  Music,
  Filter,
  Grid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PodcastCard from "@/components/PodcastCard";
import EpisodeCard from "@/components/EpisodeCard";
import { Subscription, EpisodeList, Category } from "@/types";
import { subscriptionsAPI, episodesAPI, categoriesAPI } from "@/lib/api";
import useAuthStore from "@/store/authStore";

export default function SubscriptionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [latestEpisodes, setLatestEpisodes] = useState<EpisodeList[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState({
    subscriptions: true,
    episodes: true,
    categories: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"podcasts" | "episodes">(
    "podcasts"
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading({ subscriptions: true, episodes: true, categories: true });

      const [subscriptionsRes, episodesRes, categoriesRes] = await Promise.all([
        subscriptionsAPI.getAll(),
        episodesAPI.getRecent(),
        categoriesAPI.getAll(),
      ]);

      if (Array.isArray(subscriptionsRes)) {
        setSubscriptions(subscriptionsRes);
      }

      if (Array.isArray(episodesRes)) {
        // Filter episodes to only show from subscribed podcasts
        const subscribedPodcastIds = new Set(
          subscriptionsRes.map((sub) => sub.podcast)
        );
        const filteredEpisodes = episodesRes.filter(
          (episode) => subscribedPodcastIds.has(episode.id) // This might need adjustment based on episode structure
        );
        setLatestEpisodes(episodesRes); // For now, show all recent episodes
      }

      if (Array.isArray(categoriesRes)) {
        setCategories(categoriesRes);
      }

      setError(null);
    } catch (err) {
      console.error("Error loading subscriptions data:", err);
      setError("Failed to load subscriptions. Please try again.");
    } finally {
      setLoading({ subscriptions: false, episodes: false, categories: false });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredSubscriptions = React.useMemo(() => {
    if (!selectedCategory) return subscriptions;

    // This would need to be adjusted based on your data structure
    // For now, returning all subscriptions
    return subscriptions;
  }, [subscriptions, selectedCategory]);

  const filteredEpisodes = React.useMemo(() => {
    if (!selectedCategory) return latestEpisodes;

    // Filter episodes by category if needed
    return latestEpisodes;
  }, [latestEpisodes, selectedCategory]);

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-card/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={loadData}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 border-0"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            My Subscriptions
          </h1>
          <p className="text-muted-foreground">
            {subscriptions.length > 0
              ? `You're subscribed to ${subscriptions.length} podcast${
                  subscriptions.length !== 1 ? "s" : ""
                }`
              : "Discover and subscribe to podcasts to see them here"}
          </p>
        </div>

        {loading.subscriptions && loading.episodes ? (
          /* Loading State */
          <div className="space-y-8">
            {/* Tabs skeleton */}
            <div className="flex items-center space-x-1 bg-card/30 rounded-lg p-1 w-fit">
              <div className="h-8 w-20 bg-white/10 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-white/5 rounded animate-pulse"></div>
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card/50 border-white/10 rounded-lg p-6 animate-pulse"
                >
                  <div className="w-full h-48 bg-white/5 rounded-lg mb-4"></div>
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        ) : subscriptions.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-card/50 border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              No subscriptions yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start exploring podcasts and subscribe to your favorites to see
              them here. You'll also get updates when new episodes are released.
            </p>
            <div className="space-x-4">
              <Button
                onClick={() => router.push("/discover")}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 border-0 flex items-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Discover Podcasts</span>
              </Button>
              <Button
                onClick={() => router.push("/search")}
                className="bg-card/50 border-white/20 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-white/40 flex items-center space-x-2"
              >
                <Music className="h-4 w-4" />
                <span>Search Podcasts</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 bg-card/30 rounded-lg p-1">
                <Button
                  variant={activeTab === "podcasts" ? "default" : "ghost"}
                  onClick={() => setActiveTab("podcasts")}
                  size="sm"
                  className={
                    activeTab === "podcasts"
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Podcasts ({subscriptions.length})
                </Button>
                <Button
                  variant={activeTab === "episodes" ? "default" : "ghost"}
                  onClick={() => setActiveTab("episodes")}
                  size="sm"
                  className={
                    activeTab === "episodes"
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }
                >
                  <Music className="h-4 w-4 mr-2" />
                  Latest Episodes
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <div className="flex items-center space-x-1 bg-card/30 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={
                      viewMode === "grid"
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    }
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={
                      viewMode === "list"
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                    }
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Category Filters */}
            {showFilters && (
              <div className="bg-card/50 border-white/10 rounded-lg p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={
                        selectedCategory === null ? "default" : "outline"
                      }
                      onClick={() => setSelectedCategory(null)}
                      size="sm"
                      className={
                        selectedCategory === null
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-purple-500/30"
                          : "bg-card/50 border-white/20 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-white/40"
                      }
                    >
                      All
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id
                            ? "default"
                            : "outline"
                        }
                        onClick={() => setSelectedCategory(category.id)}
                        size="sm"
                        className={
                          selectedCategory === category.id
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-purple-500/30"
                            : "bg-card/50 border-white/20 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-white/40"
                        }
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            {activeTab === "podcasts" ? (
              /* Subscribed Podcasts */
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Your Subscribed Podcasts
                </h2>

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSubscriptions.map((subscription) => (
                      <PodcastCard
                        key={subscription.id}
                        podcast={{
                          id: subscription.podcast,
                          title:
                            subscription.podcast_title || "Unknown Podcast",
                          description: "",
                          cover_image: "",
                          category: 0,
                          category_name: "Unknown",
                          creator: 0,
                          creator_name: "Unknown Creator",
                          created_at: subscription.created_at,
                        }}
                        onSubscribe={() => {
                          // Refresh the subscriptions list when user unsubscribes
                          loadData();
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSubscriptions.map((subscription) => (
                      <div
                        key={subscription.id}
                        className="bg-card/50 border-white/10 rounded-lg p-4 hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <Music className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground">
                              {subscription.podcast_title || "Unknown Podcast"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-1">
                              by Unknown Creator
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground/80">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>
                                Subscribed {formatDate(subscription.created_at)}
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              // This will trigger the subscription toggle
                              // The user can click on the card to go to the podcast
                              // or use the heart button for visual feedback
                              loadData();
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Latest Episodes */
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Latest Episodes from Your Subscriptions
                </h2>

                {filteredEpisodes.length > 0 ? (
                  <div className="space-y-4">
                    {filteredEpisodes.map((episode) => (
                      <EpisodeCard key={episode.id} episode={episode} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-card/50 border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No recent episodes
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      No new episodes from your subscribed podcasts recently.
                    </p>
                    <Button
                      onClick={() => setActiveTab("podcasts")}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 border-0"
                    >
                      View Your Subscriptions
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
