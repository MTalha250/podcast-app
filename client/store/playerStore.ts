import { create } from "zustand";
import { Episode } from "@/types";

interface PlayerState {
  // Episode state
  currentEpisode: Episode | null;

  // Playback state
  isPlaying: boolean;

  // Actions
  setCurrentEpisode: (episode: Episode) => void;
  stop: () => void;
}

const usePlayerStore = create<PlayerState>((set) => ({
  // Initial state
  currentEpisode: null,
  isPlaying: false,

  // Actions
  setCurrentEpisode: (episode) =>
    set({
      currentEpisode: episode,
      isPlaying: true,
    }),

  stop: () =>
    set({
      currentEpisode: null,
      isPlaying: false,
    }),
}));

export default usePlayerStore;
