"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PodcastCard from "@/components/PodcastCard";
import EpisodeCard from "@/components/EpisodeCard";
import { Category, SearchResult } from "@/types";
import { searchAPI, categoriesAPI } from "@/lib/api";

function SearchPageContent() {
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
          <div className="w-24 h-24 bg-card/50 border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Search for podcasts and episodes
          </h2>
          <p className="text-muted-foreground mb-8">
            Discover your next favorite podcast or find specific episodes
          </p>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-foreground">
                  Recent Searches
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              </div>
              <div className="space-y-2">
                {recentSearches.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(query)}
                    className="flex items-center space-x-2 w-full p-2 text-left text-sm text-muted-foreground hover:bg-card/50 hover:text-foreground rounded transition-all duration-200"
                  >
                    <Clock className="h-4 w-4" />
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
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
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
      );
    }

    if (!filteredResults || totalResults === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-card/50 border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            No results found
          </h2>
          <p className="text-muted-foreground">
            Try adjusting your search or browse by category
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {totalResults} result{totalResults !== 1 ? "s" : ""} for "
            {searchQuery}"
          </h2>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-card/50 border-white/10 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
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
                  All
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
          </div>
        )}

        {/* Content Tabs */}
        <div className="flex items-center space-x-1 bg-card/30 rounded-lg p-1 w-fit">
          <Button
            variant={activeTab === "all" ? "default" : "ghost"}
            onClick={() => setActiveTab("all")}
            size="sm"
            className={
              activeTab === "all"
                ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }
          >
            All ({totalResults})
          </Button>
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
            Podcasts ({filteredResults.podcasts.length})
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
            Episodes ({filteredResults.episodes.length})
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-8">
          {/* Podcasts Section */}
          {(activeTab === "all" || activeTab === "podcasts") &&
            filteredResults.podcasts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Podcasts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.podcasts.map((podcast) => (
                    <PodcastCard key={podcast.id} podcast={podcast} />
                  ))}
                </div>
              </div>
            )}

          {/* Episodes Section */}
          {(activeTab === "all" || activeTab === "episodes") &&
            filteredResults.episodes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Episodes
                </h3>
                <div className="space-y-4">
                  {filteredResults.episodes.map((episode) => (
                    <EpisodeCard key={episode.id} episode={episode} />
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Search
          </h1>
          <p className="text-muted-foreground">
            Find your next favorite podcast or episode
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search podcasts and episodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg bg-card/50 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
              />
              {searchQuery && (
                <Button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults(null);
                  }}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
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

// Loading component for Suspense fallback
function SearchPageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-white/10 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-white/5 rounded w-64 animate-pulse"></div>
        </div>
        <div className="max-w-2xl mx-auto mb-8">
          <div className="h-12 bg-white/10 rounded-lg animate-pulse"></div>
        </div>
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-card/50 border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="h-6 bg-white/10 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-white/5 rounded w-80 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// Default export with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageContent />
    </Suspense>
  );
}
