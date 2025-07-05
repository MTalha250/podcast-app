"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Play, Pause, Clock, Plus, MoreVertical, Volume2 } from "lucide-react";
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
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* Play Button */}
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlay}
                disabled={loading}
                className={`relative w-12 h-12 rounded-full transition-all duration-300 ${
                  isCurrentEpisode && isPlaying
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                    : "bg-card/50 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-muted-foreground hover:text-purple-400"
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isPlaying && isCurrentEpisode ? (
                  <>
                    <Pause className="h-5 w-5" />
                    <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-pulse" />
                  </>
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Episode Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-purple-400 transition-colors mb-2">
                    {episode.title}
                  </h3>

                  {showPodcastInfo && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Volume2 className="h-4 w-4" />
                      <span>{episode.podcast_title}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(episode.duration)}</span>
                    </div>
                    <span>•</span>
                    <span>{formatDate(episode.created_at)}</span>
                  </div>

                  {/* Description for full episode objects */}
                  {"description" in episode && episode.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mt-3 leading-relaxed">
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
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-muted-foreground hover:text-purple-400 hover:bg-white/10 rounded-full"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-card/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-20 min-w-[180px] overflow-hidden">
                      <div className="p-2">
                        <button
                          onClick={handleAddToPlaylist}
                          className="flex items-center space-x-3 w-full px-3 py-2 text-sm text-foreground hover:bg-white/10 transition-colors rounded-lg"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add to Playlist</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Playlist Selection Modal */}
      {showPlaylistModal && (
        <PlaylistSelectModal
          episode={{ id: episode.id, title: episode.title }}
          isOpen={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          onSuccess={() => {
            setShowPlaylistModal(false);
            toast.success("Episode added to playlist!");
          }}
        />
      )}
    </>
  );
}
