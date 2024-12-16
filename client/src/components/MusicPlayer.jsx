import React, { useState, useRef, useEffect } from "react";
import "../css/MusicPlayer.css";
import { assets } from "../assets/assets";

const MusicPlayer = ({ currentTrack, setCurrentTrack, songs }) => {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  // Set the audio source and play it when the track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = `http://localhost:4000${currentTrack.filePath}`;
      playSong(); // Auto-play when a new track is set
    }
  }, [currentTrack]);

  // Handle play
  const playSong = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle pause
  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Handle volume change
  const changeVolume = (e) => {
    const progressWidth = volumeRef.current.offsetWidth;
    const clickX = e.nativeEvent.offsetX;
    const newVolume = clickX / progressWidth;
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  // Handle seeking through the song (progress bar click)
  const seekSong = (e) => {
    const progressWidth = progressRef.current.offsetWidth;
    const clickX = e.nativeEvent.offsetX;
    const duration = audioRef.current.duration;
    if (audioRef.current) {
      audioRef.current.currentTime = (clickX / progressWidth) * duration;
    }
  };

  // Update the current time of the song as it plays
  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener("timeupdate", updateTime);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener("timeupdate", updateTime);
      }
    };
  }, []);

  // Skip to next song
  const nextSong = () => {
    const nextIndex = (songs.findIndex(song => song._id === currentTrack._id) + 1) % songs.length;
    setCurrentTrack(songs[nextIndex]);
  };

  // Skip to previous song
  const prevSong = () => {
    const prevIndex = (songs.findIndex(song => song._id === currentTrack._id) - 1 + songs.length) % songs.length;
    setCurrentTrack(songs[prevIndex]);
  };

  // Format time to minutes:seconds
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Prevent rendering if no song is selected
  if (!currentTrack) return null;

  return (
    <div className="music-player">
      <audio ref={audioRef}></audio>

      <div className="song-info">
        <img
          src={`http://localhost:4000${currentTrack.coverImage}`}
          alt={currentTrack.title}
        />
        <p className="song-title">{currentTrack.title}</p>
        <p className="song-album">{currentTrack.artist || "Unknown"}</p>
      </div>

      <div className="middle-section">
        <div className="progress-container">
          <span>{formatTime(currentTime)}</span>
          <div className="progress-bar" ref={progressRef} onClick={seekSong}>
            <div
              className="progress"
              style={{
                width: `${(currentTime / (audioRef.current?.duration || 1)) * 100}%`,
              }}
            ></div>
          </div>
          <span>{formatTime(audioRef.current?.duration || 0)}</span>
        </div>

        <div className="player-controls">
          <img onClick={prevSong} src={assets.prev_icon} alt="Previous" />
          {isPlaying ? (
            <img onClick={pauseSong} src={assets.pause_icon} alt="Pause" />
          ) : (
            <img onClick={playSong} src={assets.play_icon} alt="Play" />
          )}
          <img onClick={nextSong} src={assets.next_icon} alt="Next" />
        </div>
      </div>

      <div className="volume-container">
        <img src={assets.volume_icon} alt="Volume" />
        <div className="volume-bar" ref={volumeRef} onClick={changeVolume}>
          <div
            className="volume-progress"
            style={{
              width: `${volume * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
