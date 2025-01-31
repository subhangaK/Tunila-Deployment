import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "../css/LikedSongs.css";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import Header from "../components/Header";

const LikedSongs = ({ setCurrentTrack }) => {
  const [likedSongs, setLikedSongs] = useState([]);
  const { backendUrl, isLoggedin, userData } = useContext(AppContext);
  const userId = userData?.userId;

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/songs/liked-songs/${userId}`);
        setLikedSongs(response.data.likedSongs);
      } catch (error) {
        console.error("Error fetching liked songs:", error);
        toast.error("Failed to load liked songs.");
      }
    };

    if (isLoggedin) fetchLikedSongs();
  }, [backendUrl, isLoggedin, userId]);

  const handleUnlike = async (songId) => {
    try {
      await axios.post(`${backendUrl}/api/songs/unlike`, { userId, songId });
      setLikedSongs((prevLiked) => prevLiked.filter((song) => song._id !== songId));
      toast.success("Song removed from liked songs.");
    } catch (error) {
      console.error("Error unliking song:", error);
      toast.error("Failed to remove song.");
    }
  };

  return (
    <div>
    <Header />
    <div className="liked-songs-page">
      <h2>Liked Songs</h2>
      {likedSongs.length === 0 ? (
        <p>No liked songs yet.</p>
      ) : (
        <div className="songs-grid">
          {likedSongs.map((song) => (
            <div key={song._id} className="song-card">
              <img
                src={`${backendUrl}${song.coverImage}`}
                alt={song.title}
                className="song-cover"
                onClick={() => setCurrentTrack(song)}
              />
              <div className="song-info">
                <p className="song-title">{song.title}</p>
                <p className="song-artist">{song.artist}</p>
                <div className="song-options">
                  <img
                    src={assets.liked_icon}
                    alt="Unlike"
                    className="like-icon"
                    onClick={() => handleUnlike(song._id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default LikedSongs;
