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

  const handleUnsubscribe = (podcastId: number) => {
    setSubscriptions(subscriptions.filter((sub) => sub.podcast !== podcastId));
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Subscriptions
          </h1>
          <p className="text-gray-600">
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
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        ) : subscriptions.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No subscriptions yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring podcasts and subscribe to your favorites to see
              them here. You'll also get updates when new episodes are released.
            </p>
            <div className="space-x-4">
              <Button
                onClick={() => router.push("/discover")}
                className="flex items-center space-x-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Discover Podcasts</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/search")}
                className="flex items-center space-x-2"
              >
                <Music className="h-4 w-4" />
                <span>Search Podcasts</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              {/* Tabs */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={activeTab === "podcasts" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("podcasts")}
                  className="text-sm"
                >
                  Podcasts ({subscriptions.length})
                </Button>
                <Button
                  variant={activeTab === "episodes" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("episodes")}
                  className="text-sm"
                >
                  Latest Episodes ({filteredEpisodes.length})
                </Button>
              </div>

              {/* View Controls */}
              <div className="flex items-center space-x-4">
                {/* Filters */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </Button>

                {/* View Mode (only for podcasts) */}
                {activeTab === "podcasts" && (
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className="h-8 w-8"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="h-8 w-8"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-3">
                  Filter by Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Categories
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            {activeTab === "podcasts" ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Subscribed Podcasts
                </h2>

                {filteredSubscriptions.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No podcasts match your filters
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your category filter to see more results.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedCategory(null)}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`grid gap-6 ${
                      viewMode === "grid"
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1"
                    }`}
                  >
                    {filteredSubscriptions.map((subscription) => (
                      <div
                        key={subscription.id}
                        className="bg-white rounded-lg shadow-sm"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1">
                                {subscription.podcast_title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    Subscribed{" "}
                                    {formatDate(subscription.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUnsubscribe(subscription.podcast)
                              }
                              className="flex items-center space-x-1"
                            >
                              <Heart className="h-3 w-3 fill-current" />
                              <span>Subscribed</span>
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/podcasts/${subscription.podcast}`)
                              }
                            >
                              View Podcast
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Latest Episodes from Your Subscriptions
                </h2>

                {loading.episodes ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-lg p-6 animate-pulse"
                      >
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
                ) : filteredEpisodes.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No recent episodes
                    </h3>
                    <p className="text-gray-600">
                      Check back later for new episodes from your subscribed
                      podcasts.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredEpisodes.map((episode) => (
                      <EpisodeCard
                        key={episode.id}
                        episode={episode}
                        showPodcastInfo={true}
                      />
                    ))}
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
