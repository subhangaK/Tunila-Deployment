import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import Header from "../components/Header";
import { motion } from "framer-motion";
import "../css/LikedSongs.css";

const LikedSongs = ({ setCurrentTrack }) => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const { backendUrl, isLoggedin, userData, addToQueue } =
    useContext(AppContext);
  const userId = userData?.userId;

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/songs/liked-songs/${userId}`
        );
        setLikedSongs(response.data.likedSongs);
      } catch (error) {
        console.error("Error fetching liked songs:", error);
        toast.error("Failed to load liked songs.");
      }
    };

    if (isLoggedin && userId) fetchLikedSongs();
  }, [backendUrl, isLoggedin, userId]);

  // Fetch playlists for the logged-in user
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/playlists/my-playlists`,
          {
            withCredentials: true,
          }
        );
        setPlaylists(response.data.playlists);
      } catch (error) {
        console.error("Error fetching playlists:", error);
        toast.error("Failed to load playlists.");
      }
    };

    if (isLoggedin) fetchPlaylists();
  }, [backendUrl, isLoggedin]);

  // Function to handle song play
  const handlePlaySong = (song) => {
    addToQueue(song, true); // true means play immediately
  };

  // Function to handle adding song to queue
  const handleAddToQueue = (song, e) => {
    e.stopPropagation();
    addToQueue(song);
    toast.success(`Added ${song.title} to queue`, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleUnlike = async (songId, e) => {
    e.stopPropagation();
    try {
      await axios.post(`${backendUrl}/api/songs/unlike`, {
        userId,
        songId,
      });
      setLikedSongs((prevLiked) =>
        prevLiked.filter((song) => song._id !== songId)
      );
      toast.success("Song removed from liked songs.");
    } catch (error) {
      console.error("Error unliking song:", error);
      toast.error("Failed to remove song.");
    }
  };

  // Add a song to an existing playlist
  const addToPlaylist = async (playlistId) => {
    try {
      await axios.put(
        `${backendUrl}/api/playlists/${playlistId}`,
        { songs: [selectedSong._id] },
        { withCredentials: true }
      );
      toast.success("Song added to playlist!", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error adding to playlist:", error);
      toast.error("Failed to add song to playlist. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Create a new playlist and add the selected song
  const createPlaylist = async () => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/playlists`,
        { name: newPlaylistName, isPublic: false, songs: [selectedSong._id] },
        { withCredentials: true }
      );
      setPlaylists([...playlists, response.data.playlist]);
      toast.success("New playlist created and song added!", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowModal(false);
      setNewPlaylistName("");
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div>
      <div className="liked-songs-container">
        <h2 className="liked-songs-section-title">Your Liked Songs</h2>
        <section className="liked-songs-section liked-songs-recent-releases">
          <div className="liked-songs-section-header">
            <h2>Liked Music</h2>
          </div>

          {likedSongs.length === 0 ? (
            <div className="liked-songs-empty-state">
              <p>
                You haven't liked any songs yet. Start exploring and hit the
                heart icon on songs you love!
              </p>
            </div>
          ) : (
            <div className="liked-songs-grid">
              {likedSongs.map((song) => (
                <motion.div
                  key={song._id}
                  className="liked-songs-card liked-songs-recent-card"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handlePlaySong(song)}
                >
                  <div className="liked-songs-artwork">
                    <img
                      src={`${backendUrl}${song.coverImage}`}
                      alt={song.title}
                      className="liked-songs-cover-art"
                    />
                    <div className="liked-songs-play-overlay">
                      <p className="liked-songs-fas fa-play">▶</p>
                    </div>
                  </div>
                  <div className="liked-songs-details">
                    <h3 className="liked-songs-title">{song.title}</h3>
                    <Link
                      to={`/profile/${song.artistId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="liked-songs-artist"
                    >
                      {song.artist}
                    </Link>
                  </div>
                  <div className="liked-songs-actions">
                    <button onClick={(e) => handleUnlike(song._id, e)}>
                      <img src={assets.liked_icon} alt="Unlike" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSong(song);
                        setShowModal(true);
                      }}
                    >
                      <img
                        src={assets.add_icon}
                        alt="Add to playlist"
                        className="liked-songs-fas fa-plus"
                      />
                    </button>
                    <button onClick={(e) => handleAddToQueue(song, e)}>
                      <img src={assets.add_queue_icon} alt="Add to queue" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Playlist Modal with Backdrop */}
        {showModal && (
          <>
            <div
              className="modal-backdrop"
              onClick={() => setShowModal(false)}
            ></div>
            <div className="playlist-modal">
              <div className="modal-header">
                <h3>Add to Playlist</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>

              {selectedSong && (
                <div className="selected-song-info">
                  <img
                    src={`${backendUrl}${selectedSong.coverImage}`}
                    alt={selectedSong.title}
                    className="selected-song-image"
                  />
                  <div>
                    <p className="selected-song-title">{selectedSong.title}</p>
                    <p className="selected-song-genre">{selectedSong.genre}</p>
                  </div>
                </div>
              )}

              <div className="playlist-section">
                <h4>Your Playlists</h4>
                {playlists.length > 0 ? (
                  <div className="playlists-grid">
                    {playlists.map((playlist) => (
                      <div
                        key={playlist._id}
                        className="playlist-item"
                        onClick={() => addToPlaylist(playlist._id)}
                      >
                        <div className="playlist-thumbnail">
                          <img
                            src={`${backendUrl}${playlist.coverImage}`}
                            alt={playlist.name}
                            onError={(e) => {
                              e.target.src =
                                assets.default_playlist ||
                                "/default-playlist.jpg";
                            }}
                          />
                          <div className="playlist-add-icon">+</div>
                        </div>
                        <p className="playlist-name">{playlist.name}</p>
                        <p className="playlist-songs-count">
                          {playlist.songs?.length || 0} songs
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-playlists-message">
                    You don't have any playlists yet
                  </p>
                )}
              </div>

              <div className="create-playlist-section">
                <h4>Create New Playlist</h4>
                <div className="create-playlist-form">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Playlist name"
                    className="playlist-name-input"
                  />
                  <button
                    className="create-playlist-button"
                    onClick={createPlaylist}
                    disabled={!newPlaylistName.trim()}
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LikedSongs;
