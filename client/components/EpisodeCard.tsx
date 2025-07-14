"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Play,
  Pause,
  Clock,
  Plus,
  MoreVertical,
  Volume2,
  Share2,
  Headphones,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Episode, EpisodeList } from "@/types";
import usePlayerStore from "@/store/playerStore";
import useAuthStore from "@/store/authStore";
import { episodesAPI } from "@/lib/api";
import PlaylistSelectModal from "./PlaylistSelectModal";

interface EpisodeCardProps {
  episode: Episode | EpisodeList;
  showPodcastInfo?: boolean;
  onAddToPlaylist?: (episodeId: number) => void;
  className?: string;
}

export default function EpisodeCard({
  episode,
  showPodcastInfo = true,
  onAddToPlaylist,
  className,
}: EpisodeCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const { currentEpisode, isPlaying, setCurrentEpisode } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const isCurrentEpisode = currentEpisode?.id === episode.id;

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showMenu && !target.closest(".relative")) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handlePlay = async () => {
    if (isCurrentEpisode && isPlaying) {
      // If currently playing this episode, we can't pause from here
      // The audio player handles pause/play internally
      return;
    }

    try {
      setLoading(true);

      // Check if we already have the full episode data
      if ("audio_file" in episode) {
        setCurrentEpisode(episode as Episode);
        toast.success(`Now playing: ${episode.title}`);
      } else {
        // Fetch full episode data for EpisodeList items
        const loadingToast = toast.loading("Loading episode...");
        const fullEpisode = await episodesAPI.getById(episode.id);
        setCurrentEpisode(fullEpisode);
        toast.success(`Now playing: ${episode.title}`, {
          id: loadingToast,
        });
      }
    } catch (error: any) {
      console.error("Error loading episode:", error);
      toast.error(
        error?.response?.data?.detail ||
          "Failed to load episode. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add episodes to playlists", {
        duration: 3000,
      });
      router.push("/auth/login");
      return;
    }

    if (onAddToPlaylist) {
      onAddToPlaylist(episode.id);
    } else {
      // Open playlist selection modal
      setShowPlaylistModal(true);
    }
    setShowMenu(false);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} mins`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Card
        className={`bg-card/60 backdrop-blur-xl border border-white/10 rounded-xl hover:scale-[1.02] hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group ${className}`}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start space-x-3 sm:space-x-4">
            {/* Play Button */}
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlay}
                disabled={loading}
                className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${
                  isCurrentEpisode && isPlaying
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                    : "bg-card/50 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-muted-foreground hover:text-purple-400"
                }`}
              >
                {loading ? (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isPlaying && isCurrentEpisode ? (
                  <>
                    <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                    <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse" />
                  </>
                ) : (
                  <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>

            {/* Episode Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm sm:text-base leading-tight line-clamp-2 text-foreground group-hover:text-purple-400 transition-colors">
                  {episode.title}
                </h3>

                {/* Menu Button */}
                <div className="relative flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="w-8 h-8 sm:w-9 sm:h-9 text-muted-foreground hover:text-foreground hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 bg-card/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl z-20 min-w-[160px] overflow-hidden">
                        {isAuthenticated && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPlaylistModal(true);
                              setShowMenu(false);
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-foreground hover:bg-white/10 transition-colors"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Add to Playlist</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add share functionality
                            setShowMenu(false);
                          }}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-foreground hover:bg-white/10 transition-colors"
                        >
                          <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Share Episode</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Episode Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                {showPodcastInfo && (
                  <div className="flex items-center gap-1">
                    <Headphones className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{episode.podcast_title}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span>{episode.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>{formatDate(episode.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Description for detailed view */}
              {"description" in episode && episode.description && (
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-2 sm:mt-3">
                  {episode.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Playlist Selection Modal */}
      {showPlaylistModal && isAuthenticated && (
        <PlaylistSelectModal
          isOpen={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          episode={{ id: episode.id, title: episode.title }}
          onSuccess={() => {
            setShowPlaylistModal(false);
            if (onAddToPlaylist) {
              onAddToPlaylist(episode.id);
            }
          }}
        />
      )}
    </>
  );
}
