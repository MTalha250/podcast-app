"use client";

import React, { useRef } from "react";
import H5AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { X, Play, Volume2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import usePlayerStore from "@/store/playerStore";

interface AudioPlayerProps {
  className?: string;
}

export default function AudioPlayer({ className }: AudioPlayerProps) {
  const { currentEpisode, isPlaying, stop } = usePlayerStore();

  const playerRef = useRef<H5AudioPlayer>(null);

  if (!currentEpisode) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-white/10 z-40">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Music className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium">
              Select an episode to start your audio journey
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-white/10 z-50 ${className}`}
    >
      <div className="max-w-7xl mx-auto p-4">
        {/* Episode Info Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            {/* Episode Cover */}
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
              <Play className="h-7 w-7 text-white" />
            </div>

            {/* Episode Details */}
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-semibold text-foreground truncate">
                {currentEpisode.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground truncate">
                  {currentEpisode.podcast_title}
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={stop}
            className="flex-shrink-0 ml-4 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-full transition-all duration-300"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Audio Player */}
        <div className="audio-player-container">
          <H5AudioPlayer
            ref={playerRef}
            src={currentEpisode.audio_file}
            showSkipControls={false}
            showJumpControls={false}
            showDownloadProgress={false}
            showFilledProgress={true}
            hasDefaultKeyBindings={false}
            autoPlayAfterSrcChange={true}
            layout="horizontal"
            customProgressBarSection={[
              RHAP_UI.CURRENT_TIME,
              RHAP_UI.PROGRESS_BAR,
              RHAP_UI.DURATION,
            ]}
            customControlsSection={[
              RHAP_UI.ADDITIONAL_CONTROLS,
              RHAP_UI.MAIN_CONTROLS,
              RHAP_UI.VOLUME_CONTROLS,
            ]}
            customAdditionalControls={[
              // Playback speed control
              <div key="speed" className="rhap_additional-control">
                <select
                  className="text-xs appearance-none bg-card/50 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1 text-foreground focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                  onChange={(e) => {
                    if (playerRef.current?.audio?.current) {
                      playerRef.current.audio.current.playbackRate = parseFloat(
                        e.target.value
                      );
                    }
                  }}
                  defaultValue="1"
                >
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1">1x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="1.75">1.75x</option>
                  <option value="2">2x</option>
                </select>
              </div>,
            ]}
            onEnded={() => {
              // Episode ended - audio player handles reset internally
            }}
            onError={(e) => {
              console.error("Audio player error:", e);
            }}
          />
        </div>
      </div>

      <style jsx>{`
        .audio-player-container :global(.rhap_container) {
          background-color: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }

        .audio-player-container :global(.rhap_main-controls-button) {
          color: #94a3b8 !important;
          width: 45px !important;
          height: 45px !important;
          transition: all 0.3s ease !important;
        }

        .audio-player-container :global(.rhap_main-controls-button):hover {
          color: #f8fafc !important;
          transform: scale(1.05) !important;
        }

        .audio-player-container :global(.rhap_play-pause-button) {
          width: 56px !important;
          height: 56px !important;
          background: linear-gradient(
            135deg,
            #8b5cf6 0%,
            #3b82f6 100%
          ) !important;
          border-radius: 50% !important;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.3s ease !important;
        }

        .audio-player-container :global(.rhap_play-pause-button):hover {
          transform: scale(1.05) !important;
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5) !important;
        }

        .audio-player-container :global(.rhap_play-pause-button svg) {
          color: white !important;
          margin: auto !important;
        }

        .audio-player-container :global(.rhap_progress-bar) {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
          height: 6px !important;
          overflow: hidden !important;
        }

        .audio-player-container :global(.rhap_progress-filled) {
          background: linear-gradient(
            90deg,
            #8b5cf6 0%,
            #3b82f6 100%
          ) !important;
          border-radius: 8px !important;
        }

        .audio-player-container :global(.rhap_progress-indicator) {
          background-color: #ffffff !important;
          border: 2px solid rgba(139, 92, 246, 0.8) !important;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3) !important;
          width: 16px !important;
          height: 16px !important;
          top: -5px !important;
          transition: all 0.3s ease !important;
        }

        .audio-player-container :global(.rhap_progress-indicator):hover {
          transform: scale(1.2) !important;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.5) !important;
        }

        .audio-player-container :global(.rhap_volume-bar) {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
          height: 4px !important;
        }

        .audio-player-container :global(.rhap_volume-indicator) {
          background-color: #ffffff !important;
          border: 2px solid rgba(59, 130, 246, 0.8) !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3) !important;
          width: 12px !important;
          height: 12px !important;
          top: -4px !important;
        }

        .audio-player-container :global(.rhap_volume-filled) {
          background: linear-gradient(
            90deg,
            #3b82f6 0%,
            #8b5cf6 100%
          ) !important;
          border-radius: 8px !important;
        }

        .audio-player-container :global(.rhap_time) {
          color: #94a3b8 !important;
          font-size: 12px !important;
          font-weight: 500 !important;
        }

        .audio-player-container :global(.rhap_additional-control) {
          margin-left: 12px !important;
        }

        .audio-player-container :global(.rhap_volume-button) {
          color: #94a3b8 !important;
          transition: all 0.3s ease !important;
        }

        .audio-player-container :global(.rhap_volume-button):hover {
          color: #f8fafc !important;
          transform: scale(1.05) !important;
        }

        .audio-player-container :global(.rhap_volume-container) {
          margin-left: 8px !important;
        }
      `}</style>
    </div>
  );
}
