"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PodcastCard from "@/components/PodcastCard";
import EpisodeCard from "@/components/EpisodeCard";
import { Category, SearchResult } from "@/types";
import { searchAPI, categoriesAPI } from "@/lib/api";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState({
    search: false,
    categories: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "podcasts" | "episodes">(
    "all"
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategories();
    loadRecentSearches();

    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  useEffect(() => {
    if (searchQuery && searchQuery !== initialQuery) {
      const timeoutId = setTimeout(() => {
        performSearch(searchQuery);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  const loadCategories = async () => {
    try {
      const categoriesRes = await categoriesAPI.getAll();
      if (Array.isArray(categoriesRes)) {
        setCategories(categoriesRes);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading({ ...loading, categories: false });
    }
  };

  const loadRecentSearches = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  };

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;

    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(
      0,
      5
    );
    setRecentSearches(updated);

    if (typeof window !== "undefined") {
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("recentSearches");
    }
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setLoading({ ...loading, search: true });
    setError(null);

    try {
      const results = await searchAPI.search(query);
      setSearchResults(results);
      saveRecentSearch(query);

      // Update URL without triggering navigation
      const url = new URL(window.location.href);
      url.searchParams.set("q", query);
      window.history.replaceState({}, "", url.toString());
    } catch (err) {
      console.error("Error searching:", err);
      setError("Failed to search. Please try again.");
    } finally {
      setLoading({ ...loading, search: false });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const filteredResults = React.useMemo(() => {
    if (!searchResults) return null;

    let podcasts = searchResults.podcasts || [];
    let episodes = searchResults.episodes || [];

    // Filter by category if selected
    if (selectedCategory) {
      const categoryName = categories.find(
        (cat) => cat.id === selectedCategory
      )?.name;
      if (categoryName) {
        podcasts = podcasts.filter(
          (podcast) => podcast.category_name === categoryName
        );
      }
    }

    return { podcasts, episodes };
  }, [searchResults, selectedCategory, categories]);

  const totalResults = filteredResults
    ? filteredResults.podcasts.length + filteredResults.episodes.length
    : 0;

  const showContent = () => {
    if (!searchQuery.trim()) {
      return (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Search for podcasts and episodes
          </h2>
          <p className="text-gray-600 mb-8">
            Discover your next favorite podcast or find specific episodes
          </p>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Recent Searches
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </Button>
              </div>
              <div className="space-y-2">
                {recentSearches.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(query)}
                    className="flex items-center space-x-2 w-full p-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded"
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{query}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (loading.search) {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Searching...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Search Error
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => performSearch(searchQuery)}>Try Again</Button>
        </div>
      );
    }

    if (!filteredResults || totalResults === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button variant="outline" onClick={() => setSelectedCategory(null)}>
            Clear Filters
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Search Results for "{searchQuery}"
            </h2>
            <p className="text-gray-600 mt-1">
              {totalResults} result{totalResults !== 1 ? "s" : ""} found
              {selectedCategory && (
                <span>
                  {" "}
                  in{" "}
                  {categories.find((cat) => cat.id === selectedCategory)?.name}
                </span>
              )}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
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

        {/* Tabs */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 w-fit">
          <Button
            variant={activeTab === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("all")}
            className="text-sm"
          >
            All ({totalResults})
          </Button>
          <Button
            variant={activeTab === "podcasts" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("podcasts")}
            className="text-sm"
          >
            Podcasts ({filteredResults.podcasts.length})
          </Button>
          <Button
            variant={activeTab === "episodes" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("episodes")}
            className="text-sm"
          >
            Episodes ({filteredResults.episodes.length})
          </Button>
        </div>

        {/* Results */}
        {(activeTab === "all" || activeTab === "podcasts") &&
          filteredResults.podcasts.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Podcasts ({filteredResults.podcasts.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.podcasts.map((podcast) => (
                  <PodcastCard
                    key={podcast.id}
                    podcast={podcast}
                    showSubscribeButton={true}
                  />
                ))}
              </div>
            </section>
          )}

        {(activeTab === "all" || activeTab === "episodes") &&
          filteredResults.episodes.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Episodes ({filteredResults.episodes.length})
              </h3>
              <div className="space-y-4">
                {filteredResults.episodes.map((episode) => (
                  <EpisodeCard
                    key={episode.id}
                    episode={episode}
                    showPodcastInfo={true}
                  />
                ))}
              </div>
            </section>
          )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search podcasts, episodes, creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 py-3 text-lg"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults(null);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Content */}
        {showContent()}
      </div>
    </div>
  );
}
