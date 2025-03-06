import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import "../css/PublishedMusic.css";
import Header from "../components/Header";
import { assets } from "../assets/assets";
import { motion } from "framer-motion";

const PublishedMusic = ({ setCurrentTrack }) => {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [likedSongs, setLikedSongs] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const { backendUrl, isLoggedin, userData, addToQueue } =
    useContext(AppContext);
  const userId = userData?.userId;

  // Function to shuffle an array
  const shuffleArray = (array) => {
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }
    return shuffledArray;
  };

  // Fetch all published songs
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/songs`);
        const shuffledSongs = shuffleArray(response.data.songs); // Shuffle songs before setting state
        setSongs(shuffledSongs);
      } catch (error) {
        console.error("Error fetching songs:", error);
        toast.error("Failed to load songs.");
      }
    };

    fetchSongs();
  }, [backendUrl]);

  // Function to handle song play
  const handlePlaySong = (song) => {
    setCurrentTrack(song);
    addToQueue(song);
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

  // Fetch user's liked songs
  useEffect(() => {
    if (isLoggedin && userId) {
      const fetchLikedSongs = async () => {
        try {
          const response = await axios.get(
            `${backendUrl}/api/songs/liked-songs/${userId}`
          );
          setLikedSongs(
            new Set(response.data.likedSongs.map((song) => song._id))
          );
        } catch (error) {
          console.error("Error fetching liked songs:", error);
        }
      };

      fetchLikedSongs();
    }
  }, [backendUrl, isLoggedin, userId]);

  // Toggle like/unlike for a song
  const handleLikeToggle = async (songId, e) => {
    e.stopPropagation();

    if (!isLoggedin) {
      toast.error("You must be logged in to like a song.");
      return;
    }

    const isLiked = likedSongs.has(songId);

    try {
      if (isLiked) {
        await axios.post(`${backendUrl}/api/songs/unlike`, { userId, songId });
        setLikedSongs((prevLiked) => {
          const updated = new Set(prevLiked);
          updated.delete(songId);
          return updated;
        });
      } else {
        await axios.post(`${backendUrl}/api/songs/like`, { userId, songId });
        setLikedSongs((prevLiked) => new Set(prevLiked).add(songId));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status.");
    }
  };

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
      <div className="published-music">
        <h2 className="section-title">Discover Music on Tunila</h2>
        <section className="tunila-section tunila-recent-releases">
          <div className="published-tunila-section-header">
            <h2>Published Music</h2>
          </div>

          {/* Songs Grid */}
          <div className="published-tunila-songs-grid">
            {songs.map((song) => (
              <motion.div
                key={song._id}
                className="published-tunila-song-card tunila-recent-card"
                whileHover={{ scale: 1.05 }}
                onClick={() => handlePlaySong(song)}
              >
                <div className="published-tunila-song-artwork">
                  <img
                    src={`${backendUrl}${song.coverImage}`}
                    alt={song.title}
                    className="published-tunila-cover-art"
                  />
                  <div className="published-tunila-play-overlay">
                    <p className="published-fas fa-play">▶</p>
                  </div>
                </div>
                <div className="published-tunila-song-details">
                  <h3 className="published-tunila-song-title">{song.title}</h3>
                  <Link
                    to={`/profile/${song.artistId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="published-tunila-song-artist"
                  >
                    {song.artist}
                  </Link>
                </div>
                <div className="published-tunila-song-actions">
                  {isLoggedin && (
                    <>
                      <button onClick={(e) => handleLikeToggle(song._id, e)}>
                        <img
                          src={
                            likedSongs.has(song._id)
                              ? assets.liked_icon
                              : assets.notliked_icon
                          }
                          alt="Like"
                        />
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
                          className="published-fas fa-plus"
                        />
                      </button>
                    </>
                  )}
                  <button onClick={(e) => handleAddToQueue(song, e)}>
                    <img src={assets.add_queue_icon} alt="Add to queue" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
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

export default PublishedMusic;
