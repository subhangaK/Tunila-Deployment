import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/PlaylistSongsPage.css";
import Header from "../components/Header";
import { assets } from "../assets/assets"; // Import assets for the delete icon
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const PlaylistSongsPage = ({ setCurrentTrack }) => {
  const { id } = useParams(); // Get the playlist ID from the route parameters
  const [playlist, setPlaylist] = useState(null);
  const { userData } = useContext(AppContext); // Access user data from AppContext

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/playlists/${id}`);
        setPlaylist(response.data.playlist);
      } catch (error) {
        console.error("Error fetching playlist:", error);
        toast.error("Failed to fetch playlist. Please try again.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    fetchPlaylist();
  }, [id]);

  const removeSongFromPlaylist = async (songId) => {
    try {
      await axios.put(
        `http://localhost:4000/api/playlists/${id}/remove-song`,
        { songId },
        { withCredentials: true }
      );

      // Update the playlist locally
      setPlaylist((prev) => ({
        ...prev,
        songs: prev.songs.filter((song) => song._id !== songId),
      }));

      toast.success("Song removed from playlist.", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error removing song from playlist:", error);
      toast.error("Failed to remove song. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (!playlist) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
      <div className="playlist-songs-page">
        <h2>{playlist.name}</h2>
        <div className="songs-grid">
          {playlist.songs.map((song) => (
            <div key={song._id} className="song-card">
              <img
                src={`http://localhost:4000${song.coverImage}`}
                alt={song.title}
                className="song-cover"
                onClick={() => setCurrentTrack(song)} // Update the current track on click
              />
              <div className="song-info">
                <p className="song-title">{song.title}</p>
                <p className="song-artist">{song.artist}</p>
              </div>
              {/* Conditionally render the delete icon only for the playlist owner */}
              {userData?.userId === playlist.owner && (
                <img
                  src={assets.delete_icon} // Use delete icon from assets
                  alt="Delete"
                  className="delete-icon"
                  onClick={() => removeSongFromPlaylist(song._id)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistSongsPage;
