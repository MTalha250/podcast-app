"use client";

import React, { useRef } from "react";
import H5AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { X, Play } from "lucide-react";
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          Select an episode to start listening
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 ${className}`}
    >
      <div className="max-w-7xl mx-auto p-4">
        {/* Episode Info Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {/* Episode Cover */}
            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
              <Play className="h-6 w-6 text-gray-600" />
            </div>

            {/* Episode Details */}
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {currentEpisode.title}
              </h4>
              <p className="text-xs text-gray-600 truncate">
                {currentEpisode.podcast_title}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={stop}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
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
                  className="text-xs appearance-none bg-gray-100 border border-gray-300 rounded px-2 py-1 text-gray-700 focus:border-gray-500 focus:outline-none"
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
          color: #6b7280 !important;
          width: 45px !important;
          height: 45px !important;
        }

        .audio-player-container :global(.rhap_main-controls-button):hover {
          color: #374151 !important;
        }

        .audio-player-container :global(.rhap_play-pause-button) {
          width: 50px !important;
          height: 50px !important;
          background-color: #000000 !important;
          border-radius: 50% !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .audio-player-container :global(.rhap_play-pause-button svg) {
          color: white !important;
          margin: auto !important;
        }

        .audio-player-container :global(.rhap_progress-filled) {
          background-color: #000000 !important;
        }

        .audio-player-container :global(.rhap_progress-indicator) {
          background-color: #000000 !important;
          border: 2px solid white !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }

        .audio-player-container :global(.rhap_volume-indicator) {
          background-color: #000000 !important;
        }

        .audio-player-container :global(.rhap_volume-filled) {
          background-color: #000000 !important;
        }

        .audio-player-container :global(.rhap_time) {
          color: #6b7280 !important;
          font-size: 12px !important;
        }

        .audio-player-container :global(.rhap_additional-control) {
          margin-left: 10px !important;
        }

        .audio-player-container :global(.rhap_volume-button) {
          color: #6b7280 !important;
        }

        .audio-player-container :global(.rhap_volume-button):hover {
          color: #374151 !important;
        }
      `}</style>
    </div>
  );
}
