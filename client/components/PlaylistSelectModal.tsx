"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Music, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Modal from "@/components/Modal";
import { Episode, Playlist, PlaylistCreate } from "@/types";
import { playlistsAPI } from "@/lib/api";

interface PlaylistSelectModalProps {
  episode: { id: number; title: string };
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PlaylistSelectModal({
  episode,
  isOpen,
  onClose,
  onSuccess,
}: PlaylistSelectModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPlaylists();
    }
  }, [isOpen]);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const data = await playlistsAPI.getAll();
      setPlaylists(data);
    } catch (error) {
      console.error("Error loading playlists:", error);
      toast.error("Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: number) => {
    try {
      setAddingTo(playlistId);
      await playlistsAPI.addEpisode(playlistId, episode.id);
      const playlist = playlists.find((p) => p.id === playlistId);
      toast.success(`Added to "${playlist?.name}" playlist!`);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Error adding to playlist:", error);
      toast.error(error?.response?.data?.detail || "Failed to add to playlist");
    } finally {
      setAddingTo(null);
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

    try {
      setCreating(true);
      // Create new playlist
      const newPlaylist = await playlistsAPI.create({
        name: newPlaylistName.trim(),
      });

      // Add episode to the new playlist
      await playlistsAPI.addEpisode(newPlaylist.id, episode.id);

      toast.success(`Created "${newPlaylist.name}" and added episode!`);
      onSuccess?.();
      onClose();
      setNewPlaylistName("");
      setShowCreateNew(false);
    } catch (error: any) {
      console.error("Error creating playlist:", error);
      toast.error(error?.response?.data?.detail || "Failed to create playlist");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Playlist"
      description={episode.title}
      className="max-w-md"
    >
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading playlists...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Create New Playlist */}
            {showCreateNew ? (
              <Card className="p-4 border-2 border-blue-200 bg-blue-50">
                <form onSubmit={handleCreateAndAdd}>
                  <div className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Enter playlist name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="w-full"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={creating || !newPlaylistName.trim()}
                        className="flex-1"
                      >
                        {creating ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Create & Add
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowCreateNew(false);
                          setNewPlaylistName("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </Card>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowCreateNew(true)}
                className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Playlist</span>
              </Button>
            )}

            {/* Existing Playlists */}
            {playlists.length === 0 ? (
              <div className="text-center py-8">
                <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No playlists yet</p>
                <p className="text-sm text-gray-500">
                  Create your first playlist above
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Your Playlists
                </h3>
                {playlists.map((playlist) => (
                  <Card
                    key={playlist.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleAddToPlaylist(playlist.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {playlist.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {playlist.episode_count} episodes
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {addingTo === playlist.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        ) : (
                          <Plus className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
