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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Playlists</h1>
            <p className="text-gray-600 mt-1">
              Create and manage your podcast playlists
            </p>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Playlist</span>
          </Button>
        </div>

        {loading.playlists ? (
          /* Loading State */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg p-4 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Playlists List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">
                    Playlists ({playlists.length})
                  </h2>
                </div>

                {playlists.length === 0 ? (
                  <div className="p-8 text-center">
                    <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No playlists yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create your first playlist to organize your favorite
                      episodes
                    </p>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Playlist</span>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedPlaylist?.id === playlist.id
                            ? "bg-blue-50"
                            : ""
                        }`}
                        onClick={() => setSelectedPlaylist(playlist)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {playlist.name}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Music className="h-3 w-3" />
                                <span>{playlist.episode_count} episodes</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatDuration(getTotalDuration(playlist))}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Created {formatDate(playlist.created_at)}
                              </span>
                            </div>
                          </div>

                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowPlaylistMenu(
                                  showPlaylistMenu === playlist.id
                                    ? null
                                    : playlist.id
                                );
                              }}
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>

                            {showPlaylistMenu === playlist.id && (
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]">
                                <div className="py-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditModal(playlist);
                                    }}
                                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDeleteModal(playlist);
                                    }}
                                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Playlist Details */}
            <div className="lg:col-span-2">
              {selectedPlaylist ? (
                <div className="bg-white rounded-lg shadow-sm">
                  {/* Playlist Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {selectedPlaylist.name}
                        </h2>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Music className="h-4 w-4" />
                            <span>
                              {selectedPlaylist.episode_count} episodes
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatDuration(
                                getTotalDuration(selectedPlaylist)
                              )}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Created {formatDate(selectedPlaylist.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {selectedPlaylist.episodes &&
                        selectedPlaylist.episodes.length > 0 && (
                          <Button className="flex items-center space-x-2">
                            <Play className="h-4 w-4" />
                            <span>Play All</span>
                          </Button>
                        )}
                    </div>
                  </div>

                  {/* Episodes */}
                  <div className="p-6">
                    {!selectedPlaylist.episodes ||
                    selectedPlaylist.episodes.length === 0 ? (
                      <div className="text-center py-8">
                        <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No episodes in this playlist
                        </h3>
                        <p className="text-gray-600">
                          Add episodes to this playlist to start building your
                          collection
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedPlaylist.episodes.map((episode) => (
                          <EpisodeCard
                            key={episode.id}
                            episode={episode}
                            showPodcastInfo={true}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Select a playlist
                  </h3>
                  <p className="text-gray-600">
                    Choose a playlist from the list to view its episodes
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Playlist Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setNewPlaylistName("");
          }}
          title="Create Playlist"
          description="Enter a name for your new playlist"
        >
          <div className="p-6">
            <form onSubmit={handleCreatePlaylist}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Playlist Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPlaylistName("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading.creating || !newPlaylistName.trim()}
                  className="flex-1"
                >
                  {loading.creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Edit Playlist Modal */}
        <Modal
          isOpen={showEditModal && !!playlistToEdit}
          onClose={() => {
            setShowEditModal(false);
            setPlaylistToEdit(null);
            setNewPlaylistName("");
          }}
          title="Edit Playlist"
          description="Update the name of your playlist"
        >
          <div className="p-6">
            <form onSubmit={handleEditPlaylist}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Playlist Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setPlaylistToEdit(null);
                    setNewPlaylistName("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading.updating || !newPlaylistName.trim()}
                  className="flex-1"
                >
                  {loading.updating ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal && !!playlistToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setPlaylistToDelete(null);
          }}
          title="Delete Playlist"
          description={`Are you sure you want to delete "${playlistToDelete?.name}"? This action cannot be undone.`}
        >
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setPlaylistToDelete(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeletePlaylist}
                disabled={loading.deleting}
                variant="destructive"
                className="flex-1"
              >
                {loading.deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
