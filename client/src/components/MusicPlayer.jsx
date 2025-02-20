import React, { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import "../css/MusicPlayer.css";

const MusicPlayer = () => {
  const {
    backendUrl,
    userData,
    recommendedSongs,
    queue,
    setQueue,
    currentTrackIndex,
    setCurrentTrackIndex,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    shuffle,
    setShuffle,
    repeat,
    setRepeat,
    autoplay,
    setAutoplay,
  } = useContext(AppContext);

  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showQueue, setShowQueue] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [miniMode, setMiniMode] = useState(false);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  const [savedVolume, setSavedVolume] = useState(volume);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState([]);
  const [isBuffering, setIsBuffering] = useState(false);

  // Check scroll position for mini mode
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setMiniMode(scrollPosition > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Main audio playback effect
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Playback started successfully
              setIsBuffering(false);
            })
            .catch((error) => {
              // Auto-play was prevented or another error occurred
              console.error("Playback error:", error);
              setIsPlaying(false);
            });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex, queue, setIsPlaying]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent handling if user is typing in an input field
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          setIsPlaying((prevState) => !prevState);
          break;
        case "ArrowRight":
          if (e.ctrlKey || e.metaKey) {
            handleNext();
          } else {
            // Skip 5 seconds ahead
            audioRef.current.currentTime += 5;
          }
          break;
        case "ArrowLeft":
          if (e.ctrlKey || e.metaKey) {
            handlePrevious();
          } else {
            // Skip 5 seconds back
            audioRef.current.currentTime -= 5;
          }
          break;
        case "KeyM":
          toggleMute();
          break;
        case "KeyQ":
          setShowQueue((prev) => !prev);
          break;
        case "KeyS":
          toggleShuffle();
          break;
        case "KeyR":
          toggleRepeat();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setIsPlaying]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Update time display
  const handleTimeUpdate = () => {
    if (!isDraggingProgress) {
      setCurrentTime(audioRef.current.currentTime);
    }
    setDuration(audioRef.current.duration || 0);
  };

  // Handle track ending
  const handleEnded = () => {
    if (repeat === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .catch((err) => console.error("Replay error:", err));
    } else {
      handleNext();
    }
  };

  // Skip to next track
  const handleNext = () => {
    if (queue.length === 0) return;

    if (shuffle) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * queue.length);
      } while (randomIndex === currentTrackIndex && queue.length > 1);

      setCurrentTrackIndex(randomIndex);
    } else if (currentTrackIndex < queue.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      if (repeat === "all") {
        setCurrentTrackIndex(0);
      } else if (autoplay && recommendedSongs.length > 0) {
        // Add recommended songs to queue
        const newRecommendations = recommendedSongs.filter(
          (song) => !queue.some((queueSong) => queueSong.id === song.id)
        );
        if (newRecommendations.length > 0) {
          const newQueue = [...queue, ...newRecommendations];
          setQueue(newQueue);
          setCurrentTrackIndex(currentTrackIndex + 1);
        } else {
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    }
  };

  // Go to previous track or restart current
  const handlePrevious = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      // If more than 3 seconds into song, restart it
      audioRef.current.currentTime = 0;
    } else if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  // Format time display (mm:ss)
  const formatTime = (time) => {
    if (isNaN(time) || time === Infinity) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle click on progress bar
  const handleProgressClick = (e) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    if (isFinite(newTime)) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle drag start on progress bar
  const handleProgressDragStart = () => {
    setIsDraggingProgress(true);
  };

  // Handle drag on progress bar
  const handleProgressDrag = (e) => {
    if (!isDraggingProgress || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    if (isFinite(newTime)) {
      setCurrentTime(newTime);
    }
  };

  // Handle drag end on progress bar
  const handleProgressDragEnd = () => {
    if (isDraggingProgress && isFinite(currentTime)) {
      audioRef.current.currentTime = currentTime;
    }
    setIsDraggingProgress(false);
  };

  // Effect for progress bar dragging
  useEffect(() => {
    if (isDraggingProgress) {
      document.addEventListener("mousemove", handleProgressDrag);
      document.addEventListener("mouseup", handleProgressDragEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleProgressDrag);
      document.removeEventListener("mouseup", handleProgressDragEnd);
    };
  }, [isDraggingProgress]);

  // Toggle shuffle mode
  const toggleShuffle = () => setShuffle(!shuffle);

  // Toggle repeat mode
  const toggleRepeat = () => {
    const modes = ["off", "all", "one"];
    setRepeat(modes[(modes.indexOf(repeat) + 1) % modes.length]);
  };

  // Toggle mute
  const toggleMute = () => {
    if (volume > 0) {
      setSavedVolume(volume);
      setVolume(0);
    } else {
      setVolume(savedVolume || 0.5);
    }
  };

  // Get volume icon based on level
  const getVolumeIcon = () => {
    if (volume === 0) return assets.volume_mute_icon || assets.volume_icon;
    if (volume < 0.3) return assets.volume_low_icon || assets.volume_icon;
    if (volume < 0.7) return assets.volume_medium_icon || assets.volume_icon;
    return assets.volume_icon;
  };

  // Queue drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
    // Add dragging class
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Highlight drop area
    const items = document.querySelectorAll(".music-player-queue-item");
    items.forEach((item) => item.classList.remove("drag-over"));

    if (index !== draggedItem) {
      items[index]?.classList.add("drag-over");
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();

    // Remove all drag-over classes
    const items = document.querySelectorAll(".music-player-queue-item");
    items.forEach((item) => item.classList.remove("drag-over"));

    if (draggedItem === null || draggedItem === targetIndex) return;

    const newQueue = [...queue];
    const [removed] = newQueue.splice(draggedItem, 1);
    newQueue.splice(targetIndex, 0, removed);

    setQueue(newQueue);

    // Update current track index if needed
    if (currentTrackIndex === draggedItem) {
      setCurrentTrackIndex(targetIndex);
    } else if (
      (targetIndex <= currentTrackIndex && draggedItem > currentTrackIndex) ||
      (targetIndex > currentTrackIndex && draggedItem <= currentTrackIndex)
    ) {
      // If the drag action crossed the current track, adjust index
      const offset = draggedItem < targetIndex ? -1 : 1;
      setCurrentTrackIndex(currentTrackIndex + offset);
    }

    setDraggedItem(null);
  };

  const removeFromQueue = (index) => {
    if (queue.length <= 1) return;

    const newQueue = [...queue];
    newQueue.splice(index, 1);
    setQueue(newQueue);

    // Adjust current track index if needed
    if (index === currentTrackIndex) {
      // If removing current track, play next or previous
      if (index < newQueue.length) {
        // Keep same index (which is now the next song)
        setCurrentTrackIndex(index);
      } else {
        // Go to previous song if removing last track
        setCurrentTrackIndex(newQueue.length - 1);
      }
    } else if (index < currentTrackIndex) {
      // If removing a track before current, adjust index
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  // Get current song
  const currentSong = queue[currentTrackIndex] || {};

  return (
    <div
      className={`music-player ${queue.length > 0 ? "active" : ""} ${
        miniMode ? "mini-mode" : ""
      }`}
    >
      <div className="music-player-player-main">
        <div className="music-player-song-info">
          {currentSong.coverImage && (
            <img
              src={`${backendUrl}${currentSong.coverImage}`}
              alt={currentSong.title || "Cover Art"}
            />
          )}
          <div>
            <h4>{currentSong.title || "No song playing"}</h4>
            {currentSong.artistId && (
              <Link to={`/profile/${currentSong.artistId}`}>
                <p>
                  {typeof currentSong.artist === "object"
                    ? currentSong.artist?.name
                    : currentSong.artist}
                </p>
              </Link>
            )}
          </div>
        </div>

        <div className="music-player-controls">
          <div className="music-player-top-controls">
            <button
              onClick={toggleShuffle}
              className={shuffle ? "active" : ""}
              title="Shuffle (S)"
            >
              <img
                src={shuffle ? assets.shuffle_icon : assets.shuffle_off_icon}
                alt="Shuffle"
              />
            </button>
            <button onClick={handlePrevious} title="Previous (Ctrl+←)">
              <img
                className="music-player-prevIcon"
                src={assets.prev_icon}
                alt="Previous"
              />
            </button>
            <button
              className="music-player-play-pause"
              onClick={() => setIsPlaying(!isPlaying)}
              title="Play/Pause (Space)"
            >
              {isBuffering ? (
                <span className="buffering-indicator">
                  <span className="buffering-dot"></span>
                  <span className="buffering-dot"></span>
                  <span className="buffering-dot"></span>
                </span>
              ) : (
                <img
                  src={isPlaying ? assets.pause_icon : assets.play_icon}
                  alt={isPlaying ? "Pause" : "Play"}
                />
              )}
              <span className="music-player-key-command">Space</span>
            </button>
            <button onClick={handleNext} title="Next (Ctrl+→)">
              <img
                className="music-player-nextIcon"
                src={assets.next_icon}
                alt="Next"
              />
            </button>
            <button
              onClick={toggleRepeat}
              className={repeat !== "off" ? "active" : ""}
              title="Repeat (R)"
            >
              <img src={assets.loop_icon} alt="Repeat" />
              {repeat === "one" && <span className="repeat-one">1</span>}
            </button>
          </div>

          <div
            className="music-player-progress-container"
            onClick={handleProgressClick}
            ref={progressRef}
            onMouseDown={handleProgressDragStart}
          >
            <div
              className="music-player-progress-bar"
              style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            />
            <div className="music-player-time-display">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className="music-player-right-controls">
          <div
            className="music-player-volume-control"
            onMouseEnter={() => setShowVolumeTooltip(true)}
            onMouseLeave={() => setShowVolumeTooltip(false)}
            data-volume={`${Math.round(volume * 100)}%`}
          >
            <img
              src={getVolumeIcon()}
              alt="Volume"
              onClick={toggleMute}
              title="Mute (M)"
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{
                background: `linear-gradient(to right, #3498db 0%, #3498db ${
                  volume * 100
                }%, #e0e0e0 ${volume * 100}%, #e0e0e0 100%)`,
              }}
            />
          </div>
          <div
            className="music-player-queue-btn"
            onClick={() => setShowQueue(!showQueue)}
            data-count={queue.length}
            title="Queue (Q)"
          >
            <img src={assets.queue_icon} alt="Queue" />
          </div>
          <div className="music-player-autoplay-toggle">
            <span>Autoplay</span>
            <img
              src={autoplay ? assets.switch_on_icon : assets.switch_off_icon}
              alt="Autoplay"
              onClick={() => setAutoplay(!autoplay)}
              title={autoplay ? "Disable Autoplay" : "Enable Autoplay"}
            />
          </div>
        </div>
      </div>

      {showQueue && (
        <div className="music-player-queue-panel">
          <div className="music-player-queue-header">
            <h3>Queue ({queue.length})</h3>
            <button onClick={() => setShowQueue(false)}>
              <img src={assets.close_icon} alt="Close" />
            </button>
          </div>
          <div className="music-player-queue-list">
            {queue.length === 0 ? (
              <div className="music-player-empty-queue">
                <p>Your queue is empty</p>
              </div>
            ) : (
              queue.map((song, index) => (
                <div
                  key={`queue-${song.id || index}`}
                  className={`music-player-queue-item ${
                    index === currentTrackIndex ? "current" : ""
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {index === currentTrackIndex && (
                    <div className="now-playing-equalizer">
                      <div className="equalizer-bar"></div>
                      <div className="equalizer-bar"></div>
                      <div className="equalizer-bar"></div>
                    </div>
                  )}
                  <div className="music-player-drag-handle">≡</div>
                  <img
                    className="song-cover-queue"
                    src={`${backendUrl}${song.coverImage}`}
                    alt={song.title}
                  />
                  <div className="music-player-song-info">
                    <h4>{song.title}</h4>
                  </div>
                  <div
                    className="music-player-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(index);
                    }}
                  >
                    <img
                      className="remove-from-queue-icon"
                      src={assets.delete_icon}
                      alt="Remove"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        src={currentSong.filePath ? `${backendUrl}${currentSong.filePath}` : ""}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onLoadStart={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
      />
    </div>
  );
};

export default MusicPlayer;
