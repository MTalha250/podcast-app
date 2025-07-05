"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Plus,
  Edit3,
  Trash2,
  Play,
  Music,
  Clock,
  Calendar,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/Modal";
import EpisodeCard from "@/components/EpisodeCard";
import { Playlist } from "@/types";
import { playlistsAPI } from "@/lib/api";
import useAuthStore from "@/store/authStore";

export default function PlaylistsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null
  );
  const [loading, setLoading] = useState({
    playlists: true,
    creating: false,
    updating: false,
    deleting: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState<Playlist | null>(null);
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(
    null
  );
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    loadPlaylists();
  }, [isAuthenticated]);

  const loadPlaylists = async () => {
    try {
      setLoading({ ...loading, playlists: true });
      const playlistsRes = await playlistsAPI.getAll();

      if (Array.isArray(playlistsRes)) {
        setPlaylists(playlistsRes);
      }

      setError(null);
    } catch (err: any) {
      console.error("Error loading playlists:", err);
      const errorMessage =
        err?.response?.data?.detail ||
        "Failed to load playlists. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading({ ...loading, playlists: false });
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    setLoading({ ...loading, creating: true });
    const loadingToast = toast.loading("Creating playlist...");

    try {
      const newPlaylist = await playlistsAPI.create({
        name: newPlaylistName.trim(),
      });

      setPlaylists([newPlaylist, ...playlists]);
      setNewPlaylistName("");
      setShowCreateModal(false);

      toast.success(`Playlist "${newPlaylist.name}" created successfully!`, {
        id: loadingToast,
      });
    } catch (err: any) {
      console.error("Error creating playlist:", err);
      toast.error(
        err?.response?.data?.detail ||
          "Failed to create playlist. Please try again.",
        { id: loadingToast }
      );
    } finally {
      setLoading({ ...loading, creating: false });
    }
  };

  const handleEditPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistToEdit || !newPlaylistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    setLoading({ ...loading, updating: true });
    const loadingToast = toast.loading("Updating playlist...");

    try {
      const updatedPlaylist = await playlistsAPI.update(playlistToEdit.id, {
        name: newPlaylistName.trim(),
      });

      setPlaylists(
        playlists.map((p) => (p.id === playlistToEdit.id ? updatedPlaylist : p))
      );

      if (selectedPlaylist?.id === playlistToEdit.id) {
        setSelectedPlaylist(updatedPlaylist);
      }

      setNewPlaylistName("");
      setPlaylistToEdit(null);
      setShowEditModal(false);

      toast.success(`Playlist updated to "${updatedPlaylist.name}"`, {
        id: loadingToast,
      });
    } catch (err: any) {
      console.error("Error updating playlist:", err);
      toast.error(
        err?.response?.data?.detail ||
          "Failed to update playlist. Please try again.",
        { id: loadingToast }
      );
    } finally {
      setLoading({ ...loading, updating: false });
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlistToDelete) return;

    setLoading({ ...loading, deleting: true });
    const loadingToast = toast.loading("Deleting playlist...");

    try {
      await playlistsAPI.delete(playlistToDelete.id);

      setPlaylists(playlists.filter((p) => p.id !== playlistToDelete.id));

      if (selectedPlaylist?.id === playlistToDelete.id) {
        setSelectedPlaylist(null);
      }

      const deletedName = playlistToDelete.name;
      setPlaylistToDelete(null);
      setShowDeleteModal(false);

      toast.success(`Playlist "${deletedName}" deleted successfully`, {
        id: loadingToast,
      });
    } catch (err: any) {
      console.error("Error deleting playlist:", err);
      toast.error(
        err?.response?.data?.detail ||
          "Failed to delete playlist. Please try again.",
        { id: loadingToast }
      );
    } finally {
      setLoading({ ...loading, deleting: false });
    }
  };

  const openEditModal = (playlist: Playlist) => {
    setPlaylistToEdit(playlist);
    setNewPlaylistName(playlist.name);
    setShowEditModal(true);
    setShowPlaylistMenu(null);
  };

  const openDeleteModal = (playlist: Playlist) => {
    setPlaylistToDelete(playlist);
    setShowDeleteModal(true);
    setShowPlaylistMenu(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalDuration = (playlist: Playlist) => {
    if (!playlist.episodes || !Array.isArray(playlist.episodes)) {
      return 0;
    }
    return playlist.episodes.reduce(
      (total, episode) => total + episode.duration,
      0
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

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
          <Button onClick={loadPlaylists}>Try Again</Button>
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
            My Playlists
          </h1>
          <p className="text-muted-foreground">
            {playlists.length > 0
              ? `You have ${playlists.length} playlist${
                  playlists.length !== 1 ? "s" : ""
                }`
              : "Create your first playlist to organize your favorite episodes"}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading.playlists ? (
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
        ) : playlists.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-card/50 border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              No playlists yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Create your first playlist to organize your favorite episodes and
              access them easily anytime.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 border-0 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Playlist</span>
            </Button>
          </div>
        ) : (
          /* Content */
          <div className="space-y-6">
            {/* Create Playlist Button */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedPlaylist ? selectedPlaylist.name : "All Playlists"}
                </h2>
                {selectedPlaylist && (
                  <Button
                    onClick={() => setSelectedPlaylist(null)}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to All Playlists
                  </Button>
                )}
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 border-0 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Playlist</span>
              </Button>
            </div>

            {!selectedPlaylist ? (
              /* Playlist Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="bg-card/50 border-white/10 rounded-lg p-6 hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 group cursor-pointer"
                    onClick={() => setSelectedPlaylist(playlist)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {playlist.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {playlist.episode_count} episode
                          {playlist.episode_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPlaylistMenu(
                              showPlaylistMenu === playlist.id
                                ? null
                                : playlist.id
                            );
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {showPlaylistMenu === playlist.id && (
                          <div className="absolute right-0 top-8 w-48 bg-card/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg shadow-purple-500/20 z-10">
                            <div className="py-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(playlist);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-white/5 flex items-center space-x-2"
                              >
                                <Edit3 className="h-4 w-4" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteModal(playlist);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-2"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Created {formatDate(playlist.created_at)}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {formatDuration(getTotalDuration(playlist))}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlaylist(playlist);
                        }}
                        className="w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-foreground border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        View Episodes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Selected Playlist Episodes */
              <div className="space-y-6">
                <div className="bg-card/50 border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {selectedPlaylist.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{selectedPlaylist.episode_count} episodes</span>
                    <span>•</span>
                    <span>
                      Created {formatDate(selectedPlaylist.created_at)}
                    </span>
                    <span>•</span>
                    <span>
                      {formatDuration(getTotalDuration(selectedPlaylist))}
                    </span>
                  </div>
                </div>

                {selectedPlaylist.episodes &&
                selectedPlaylist.episodes.length > 0 ? (
                  <div className="space-y-4">
                    {selectedPlaylist.episodes.map((episode) => (
                      <EpisodeCard key={episode.id} episode={episode} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-card/50 border-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Music className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No episodes yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start adding episodes to this playlist to see them here.
                    </p>
                    <Button
                      onClick={() => router.push("/discover")}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 border-0"
                    >
                      Discover Episodes
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewPlaylistName("");
        }}
        title="Create New Playlist"
      >
        <form onSubmit={handleCreatePlaylist} className="space-y-4">
          <div>
            <label
              htmlFor="playlistName"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Playlist Name
            </label>
            <Input
              id="playlistName"
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Enter playlist name"
              required
              className="bg-card/50 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                setNewPlaylistName("");
              }}
              className="bg-card/50 border-white/20 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-white/40"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading.creating}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 border-0"
            >
              {loading.creating ? "Creating..." : "Create Playlist"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Playlist Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setPlaylistToEdit(null);
          setNewPlaylistName("");
        }}
        title="Edit Playlist"
      >
        <form onSubmit={handleEditPlaylist} className="space-y-4">
          <div>
            <label
              htmlFor="editPlaylistName"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Playlist Name
            </label>
            <Input
              id="editPlaylistName"
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Enter playlist name"
              required
              className="bg-card/50 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-300"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setPlaylistToEdit(null);
                setNewPlaylistName("");
              }}
              className="bg-card/50 border-white/20 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-white/40"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading.updating}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 border-0"
            >
              {loading.updating ? "Updating..." : "Update Playlist"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Playlist Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPlaylistToDelete(null);
        }}
        title="Delete Playlist"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete "{playlistToDelete?.name}"? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setPlaylistToDelete(null);
              }}
              className="bg-card/50 border-white/20 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-white/40"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeletePlaylist}
              disabled={loading.deleting}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/30 border-0"
            >
              {loading.deleting ? "Deleting..." : "Delete Playlist"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
