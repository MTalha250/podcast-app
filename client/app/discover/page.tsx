"use client";

import React, { useEffect, useState } from "react";
import { Grid, List, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PodcastList, EpisodeList, Category } from "@/types";
import { searchAPI, categoriesAPI, episodesAPI } from "@/lib/api";
import Link from "next/link";

export default function DiscoverPage() {
  const [featuredPodcasts, setFeaturedPodcasts] = useState<PodcastList[]>([]);
  const [trendingPodcasts, setTrendingPodcasts] = useState<PodcastList[]>([]);
  const [recentEpisodes, setRecentEpisodes] = useState<EpisodeList[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trendingRes, episodesRes, categoriesRes] = await Promise.all([
        searchAPI.getTrending(),
        episodesAPI.getRecent(),
        categoriesAPI.getAll(),
      ]);

      if (Array.isArray(trendingRes)) {
        setTrendingPodcasts(trendingRes);
        setFeaturedPodcasts(trendingRes.slice(0, 6));
      }

      if (Array.isArray(episodesRes)) {
        setRecentEpisodes(episodesRes);
      }

      if (Array.isArray(categoriesRes)) {
        setCategories(categoriesRes);
      }

      setError(null);
    } catch (err) {
      console.error("Error loading discover data:", err);
      setError("Failed to load content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} mins`;
  };

  const filteredPodcasts = selectedCategory
    ? trendingPodcasts.filter(
        (podcast) =>
          podcast.category_name ===
          categories.find((cat) => cat.id === selectedCategory)?.name
      )
    : trendingPodcasts;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-card/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={loadData}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Discover Podcasts
          </h1>
          <p className="text-muted-foreground">
            Explore thousands of podcasts across every topic imaginable
          </p>
        </div>

        {/* Categories Filter */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-400" />
            Browse by Category
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="sm"
              className={
                selectedCategory === null
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 shadow-lg shadow-purple-500/30"
                  : "bg-card/50 border-white/20 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-white/40"
              }
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
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

        {/* Featured Section */}
        {!selectedCategory && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Featured Podcasts
              </h2>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-muted-foreground">
                  Editor's Choice
                </span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card
                    key={i}
                    className="bg-card/50 border-white/10 animate-pulse"
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-white/5 rounded mb-4"></div>
                      <div className="h-4 bg-white/10 rounded mb-2"></div>
                      <div className="h-3 bg-white/5 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPodcasts.map((podcast) => (
                  <Link key={podcast.id} href={`/podcasts/${podcast.id}`}>
                    <Card className="bg-card/50 border-white/10 cursor-pointer hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 group">
                      <CardContent className="p-4">
                        <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-white/5">
                          {podcast.cover_image ? (
                            <img
                              src={
                                process.env.NEXT_PUBLIC_IMAGE_URL +
                                podcast.cover_image
                              }
                              alt={podcast.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                              <Play className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-2 right-2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Play className="h-4 w-4 text-white ml-0.5" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 mb-1">
                          {podcast.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          by {podcast.creator_name}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Main Content */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {selectedCategory
                ? `${
                    categories.find((cat) => cat.id === selectedCategory)?.name
                  } Podcasts`
                : "All Podcasts"}
            </h2>

            <div className="flex items-center space-x-2">
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

          {loading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {[...Array(12)].map((_, i) => (
                <Card
                  key={i}
                  className="bg-card/50 border-white/10 animate-pulse"
                >
                  <CardContent className="p-4">
                    {viewMode === "grid" ? (
                      <>
                        <div className="aspect-square bg-white/5 rounded mb-4"></div>
                        <div className="h-4 bg-white/10 rounded mb-2"></div>
                        <div className="h-3 bg-white/5 rounded w-2/3"></div>
                      </>
                    ) : (
                      <div className="flex space-x-4">
                        <div className="w-16 h-16 bg-white/5 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-white/10 rounded mb-2"></div>
                          <div className="h-3 bg-white/5 rounded w-1/2"></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPodcasts.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPodcasts.map((podcast) => (
                  <Link key={podcast.id} href={`/podcasts/${podcast.id}`}>
                    <Card className="bg-card/50 border-white/10 cursor-pointer hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 group">
                      <CardContent className="p-4">
                        <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-white/5">
                          {podcast.cover_image ? (
                            <img
                              src={
                                process.env.NEXT_PUBLIC_IMAGE_URL +
                                podcast.cover_image
                              }
                              alt={podcast.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                              <Play className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-2 right-2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Play className="h-4 w-4 text-white ml-0.5" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 mb-1">
                          {podcast.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          by {podcast.creator_name}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground/80 bg-white/5 px-2 py-1 rounded-full">
                            {podcast.category_name}
                          </span>
                          <span className="text-xs text-muted-foreground/80">
                            More episodes
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPodcasts.map((podcast) => (
                  <Link key={podcast.id} href={`/podcasts/${podcast.id}`}>
                    <Card className="bg-card/50 border-white/10 cursor-pointer hover:bg-card/80 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 group">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-white/5 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {podcast.cover_image ? (
                              <img
                                src={
                                  process.env.NEXT_PUBLIC_IMAGE_URL +
                                  podcast.cover_image
                                }
                                alt={podcast.title}
                                className="w-full h-full object-cover rounded group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <Play className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                              {podcast.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-1">
                              by {podcast.creator_name}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground/80">
                              <span className="bg-white/5 px-2 py-1 rounded-full mr-2">
                                {podcast.category_name}
                              </span>
                              <span>More episodes</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-card/50 border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No podcasts found
              </h3>
              <p className="text-muted-foreground mb-4">
                {selectedCategory
                  ? `No podcasts found in ${
                      categories.find((cat) => cat.id === selectedCategory)
                        ?.name
                    }`
                  : "No podcasts available at the moment."}
              </p>
              {selectedCategory && (
                <Button
                  onClick={() => setSelectedCategory(null)}
                  className="bg-card/50 border-white/20 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-white/40"
                >
                  View All Podcasts
                </Button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
