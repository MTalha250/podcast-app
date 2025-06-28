"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Play, Pause, Clock, Plus, MoreVertical } from "lucide-react";
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
        className={`group hover:shadow-lg transition-shadow duration-200 ${className}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            {/* Play Button */}
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlay}
                disabled={loading}
                className={`rounded-full w-10 h-10 flex items-center justify-center ${
                  isCurrentEpisode
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                } transition-colors`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isPlaying && isCurrentEpisode ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Episode Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {episode.title}
                  </h3>

                  {showPodcastInfo && (
                    <p className="text-sm text-gray-600 mt-1">
                      {episode.podcast_title}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(episode.duration)}</span>
                    </div>
                    <span>{formatDate(episode.created_at)}</span>
                  </div>

                  {/* Description for full episode objects */}
                  {"description" in episode && episode.description && (
                    <p className="text-sm text-gray-600 line-clamp-3 mt-3">
                      {episode.description}
                    </p>
                  )}
                </div>

                {/* Menu Button */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMenu(!showMenu)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[150px]">
                      <div className="py-1">
                        <button
                          onClick={handleAddToPlaylist}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add to Playlist</span>
                        </button>

                        <button
                          onClick={() => {
                            // Handle download
                            setShowMenu(false);
                          }}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>Download</span>
                        </button>

                        <button
                          onClick={() => {
                            // Handle share
                            if (navigator.share) {
                              navigator.share({
                                title: episode.title,
                                text: `Listen to "${episode.title}" on ${episode.podcast_title}`,
                                url: window.location.href,
                              });
                            }
                            setShowMenu(false);
                          }}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                            />
                          </svg>
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Currently Playing Indicator */}
          {isCurrentEpisode && (
            <div className="mt-4 pt-4 border-t border-slate-600">
              <div className="flex items-center space-x-2 text-sm text-blue-400">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-1 h-4 bg-blue-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <span>{isPlaying ? "Now Playing" : "Paused"}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Playlist Selection Modal */}
      <PlaylistSelectModal
        episode={{ id: episode.id, title: episode.title }}
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        onSuccess={() => {
          // Optional: Could trigger a refresh of data if needed
        }}
      />
    </>
  );
}
