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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showQueue, setShowQueue] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex, queue]);

  useEffect(() => {
    // Toggle play/pause on spacebar press
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        setIsPlaying((prevState) => !prevState);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsPlaying]);

  

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    if (repeat === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    if (queue.length === 0) return;

    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      setCurrentTrackIndex(randomIndex);
    } else if (currentTrackIndex < queue.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      if (repeat === "all") {
        setCurrentTrackIndex(0);
      } else if (autoplay && recommendedSongs.length > 0) {
        const newQueue = [...queue, ...recommendedSongs];
        setQueue(newQueue);
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
  };

  const toggleShuffle = () => setShuffle(!shuffle);

  const toggleRepeat = () => {
    const modes = ["off", "all", "one"];
    setRepeat(modes[(modes.indexOf(repeat) + 1) % modes.length]);
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    if (draggedItem === null) return;

    const newQueue = [...queue];
    const [removed] = newQueue.splice(draggedItem, 1);
    newQueue.splice(targetIndex, 0, removed);
    
    setQueue(newQueue);
    if (draggedItem === currentTrackIndex) {
      setCurrentTrackIndex(targetIndex);
    } else if (targetIndex <= currentTrackIndex && draggedItem > currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else if (targetIndex >= currentTrackIndex && draggedItem < currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
    setDraggedItem(null);
  };

  const removeFromQueue = (index) => {
    const newQueue = queue.filter((_, i) => i !== index);
    setQueue(newQueue);
    if (index < currentTrackIndex) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    }
  };

  const currentSong = queue[currentTrackIndex] || {};

  return (
    <div className={`music-player ${queue.length > 0 ? "active" : ""}`}>
      <div className="music-player-player-main">
        <div className="music-player-song-info">
          <img
            src={`${backendUrl}${currentSong.coverImage}`}
            alt={currentSong.title}
          />
          <div>
            <h4>{currentSong.title}</h4>
            <Link to={`/profile/${currentSong.artistId}`}>
              <p>{typeof currentSong.artist === 'object' ? currentSong.artist?.name : currentSong.artist}</p>
            </Link>
          </div>
        </div>

        <div className="music-player-controls">
          <div className="music-player-top-controls">
            <button onClick={toggleShuffle} className={shuffle ? "active" : ""}>
              <img src={shuffle? assets.shuffle_icon: assets.shuffle_off_icon} alt="Shuffle" />
            </button>
            <button onClick={handlePrevious}>
              <img className="music-player-prevIcon" src={assets.prev_icon} alt="Previous" />
            </button>
            <button
              className="music-player-play-pause"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <img
                src={isPlaying ? assets.pause_icon : assets.play_icon}
                alt={isPlaying ? "Pause" : "Play"}
              />
            </button>
            <button onClick={handleNext}>
              <img className="music-player-nextIcon" src={assets.next_icon} alt="Next" />
            </button>
            <button
              onClick={toggleRepeat}
              className={repeat !== "off" ? "active" : ""}
            >
              <img src={assets.loop_icon} alt="Repeat" />
              {repeat === "one" && <span>1</span>}
            </button>
          </div>

          <div className="music-player-progress-container" onClick={handleProgressClick}>
            <div
              className="music-player-progress-bar"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <div className="music-player-time-display">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className="music-player-right-controls">
          <div className="music-player-volume-control">
            <img src={assets.volume_icon} alt="Volume" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          </div>
          <div
            className="music-player-queue-btn"
            onClick={() => setShowQueue(!showQueue)}
          >
          <img src={assets.queue_icon} alt="Queue" />
          </div>
          <div className="music-player-autoplay-toggle">
            <span>Autoplay</span>
            <img
              src={autoplay ? assets.switch_on_icon : assets.switch_off_icon}
              alt="Autoplay"
              onClick={() => setAutoplay(!autoplay)}
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
            {queue.map((song, index) => (
              <div
                key={index}
                className={`music-player-queue-item ${index === currentTrackIndex ? "current" : ""}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="music-player-drag-handle">≡</div>
                <img
                  className="song-cover-queue"
                  src={`${backendUrl}${song.coverImage}`}
                />
                <div className="music-player-song-info">
                  <h4>{song.title}</h4>
                </div>
                <div
                  className="music-player-remove-btn"
                  onClick={() => removeFromQueue(index)}
                >
                 <img className="remove-from-queue-icon" src={assets.delete_icon} /> 
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        src={currentSong.filePath ? `${backendUrl}${currentSong.filePath}` : ""}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
    </div>
  );
};

export default MusicPlayer;