"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg inline-block">
            <p className="font-medium">{error}</p>
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Podcasts</h1>
          <p className="text-gray-600">
            Discover amazing stories, news, and conversations from around the
            world.
          </p>
        </div>

        {/* Trending Podcasts */}
        {trendingPodcasts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Trending Podcasts
              </h2>
              <Link href="/discover">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingPodcasts.slice(0, 6).map((podcast) => (
                  <Link key={podcast.id} href={`/podcasts/${podcast.id}`}>
                    <Card className="cursor-pointer hover:shadow-lg transition-shadow group h-full">
                      <CardContent className="p-4">
                        <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-gray-100">
                          {podcast.cover_image ? (
                            <img
                              src={
                                process.env.NEXT_PUBLIC_IMAGE_URL +
                                podcast.cover_image
                              }
                              alt={podcast.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Play className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
                          {podcast.title}
                        </h3>
                        <p className="text-sm text-gray-600">
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

        {/* Recent Episodes */}
        {recentEpisodes.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Episodes
              </h2>
              <Link href="/discover">
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentEpisodes.slice(0, 6).map((episode) => (
                  <EpisodeCard
                    key={episode.id}
                    episode={episode}
                    showPodcastInfo={true}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/discover?category=${category.name.toLowerCase()}`}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow group text-center">
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading &&
          trendingPodcasts.length === 0 &&
          recentEpisodes.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No content available
              </h3>
              <p className="text-gray-600 mb-4">
                There are no podcasts or episodes available at the moment.
              </p>
              <Button onClick={loadData} variant="outline">
                Refresh
              </Button>
            </div>
          )}
      </div>
    </div>
  );
}
