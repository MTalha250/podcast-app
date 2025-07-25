"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Play,
  TrendingUp,
  Clock,
  Star,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import EpisodeCard from "@/components/EpisodeCard";
import { PodcastList, EpisodeList, Category } from "@/types";
import { searchAPI, categoriesAPI, episodesAPI } from "@/lib/api";

export default function HomePage() {
  const [trendingPodcasts, setTrendingPodcasts] = useState<PodcastList[]>([]);
  const [recentEpisodes, setRecentEpisodes] = useState<EpisodeList[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [trendingResponse, episodesResponse, categoriesResponse] =
        await Promise.all([
          searchAPI.getTrending(),
          episodesAPI.getRecent(),
          categoriesAPI.getAll(),
        ]);

      if (Array.isArray(trendingResponse)) {
        setTrendingPodcasts(trendingResponse);
      }

      if (Array.isArray(episodesResponse)) {
        setRecentEpisodes(episodesResponse);
      }

      if (Array.isArray(categoriesResponse)) {
        setCategories(categoriesResponse);
      }

      setError(null);
    } catch (err) {
      setError("Failed to load content. Please try again.");
      console.error("Homepage error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-card/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl max-w-md mx-auto shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button
              onClick={loadData}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="relative mb-12 sm:mb-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30">
                <Play className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                Discover Amazing
              </span>
              <br />
              <span className="bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent animate-pulse">
                Podcasts
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
              Immerse yourself in captivating stories, insightful conversations,
              and cutting-edge knowledge from creators around the world.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link href="/discover">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-full transition-all duration-300 hover:scale-105 shadow-xl shadow-purple-500/40 border-0">
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Start Listening
                </Button>
              </Link>
              <Link href="/search">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto bg-card/50 border-white/20 text-foreground hover:bg-card/80 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                >
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Explore Trending
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse opacity-20" />
          <div
            className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse opacity-20"
            style={{ animationDelay: "1s" }}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          <div className="text-center p-4 sm:p-6 bg-card/50 backdrop-blur-xl border border-white/10 rounded-xl">
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              500+
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Premium Podcasts
            </p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-card/50 backdrop-blur-xl border border-white/10 rounded-xl">
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              10K+
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Happy Listeners
            </p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-card/50 backdrop-blur-xl border border-white/10 rounded-xl">
            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
              24/7
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Available Streaming
            </p>
          </div>
        </div>

        {error && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              onClick={loadData}
              variant="outline"
              className="bg-card/50 border-white/20 text-foreground hover:bg-card/80"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Trending Podcasts */}
        {trendingPodcasts.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Trending Now
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Popular podcasts this week
                  </p>
                </div>
              </div>
              <Link href="/discover">
                <Button
                  variant="ghost"
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-sm sm:text-base"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card
                    key={i}
                    className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl hover:scale-105 transition-transform duration-300 animate-pulse"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="aspect-square bg-muted/20 rounded-lg mb-4"></div>
                      <div className="h-4 sm:h-6 bg-muted/20 rounded mb-3"></div>
                      <div className="h-3 sm:h-4 bg-muted/20 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {trendingPodcasts.slice(0, 6).map((podcast) => (
                  <Link key={podcast.id} href={`/podcasts/${podcast.id}`}>
                    <Card className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl hover:scale-105 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-4 sm:p-6">
                        <div className="aspect-square relative mb-4 overflow-hidden rounded-xl">
                          {podcast.cover_image ? (
                            <img
                              src={podcast.cover_image}
                              alt={podcast.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                              <Play className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute top-3 right-3 w-6 h-6 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Play className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-base sm:text-lg truncate leading-tight line-clamp-2 text-foreground group-hover:text-purple-400 transition-colors mb-2">
                          {podcast.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                          by {podcast.creator_name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="bg-purple-500/10 text-purple-400 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                            {podcast.category_name}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-current text-yellow-400" />
                            <span>4.8</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Recent Episodes */}
        {recentEpisodes.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Fresh Episodes
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Just dropped, ready to play
                  </p>
                </div>
              </div>
              <Link href="/discover">
                <Button
                  variant="ghost"
                  className="text-green-400 hover:text-green-300 hover:bg-green-500/10 text-sm sm:text-base"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 sm:space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Card
                    key={i}
                    className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl hover:scale-[1.02] transition-transform duration-300 animate-pulse"
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex space-x-3 sm:space-x-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted/20 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 sm:h-5 bg-muted/20 rounded mb-2"></div>
                          <div className="h-3 sm:h-4 bg-muted/20 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recentEpisodes.slice(0, 6).map((episode) => (
                  <EpisodeCard
                    key={episode.id}
                    episode={episode}
                    showPodcastInfo={true}
                    className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl hover:scale-[1.02] hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-12 sm:mb-16">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    Browse Categories
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Find podcasts by topic
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/discover?category=${category.id}`}
                >
                  <Card className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl hover:scale-105 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-4 sm:p-6 text-center">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-purple-400 transition-colors">
                        {category.name}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-card/80 backdrop-blur-xl border border-white/10 p-12 rounded-3xl max-w-4xl mx-auto shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of listeners discovering amazing content every day.
              Your next favorite podcast is waiting.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 px-8 py-3 text-lg">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/discover">
                <Button
                  variant="outline"
                  className="px-8 py-3 text-white text-lg bg-card/50 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  Explore Now
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
