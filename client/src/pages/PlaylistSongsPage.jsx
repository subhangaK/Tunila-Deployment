import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/PlaylistSongsPage.css";
import Header from "../components/Header";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { motion } from "framer-motion";

const PlaylistSongsPage = ({ setCurrentTrack }) => {
  const { id } = useParams(); // Get the playlist ID from the route parameters
  const [playlist, setPlaylist] = useState(null);
  const [likedSongs, setLikedSongs] = useState(new Set()); // Store liked songs
  const [showMenu, setShowMenu] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [playlists, setPlaylists] = useState([]); // Store user playlists
  const [selectedSong, setSelectedSong] = useState(null);

  const { backendUrl, userData, isLoggedin, addToQueue } =
    useContext(AppContext);
  const userId = userData?.userId;

  // Fetch playlist data
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/playlists/${id}`);
        setPlaylist(response.data.playlist);
      } catch (error) {
        console.error("Error fetching playlist:", error);
        toast.error("Failed to fetch playlist. Please try again.");
      }
    };

    fetchPlaylist();
  }, [id, backendUrl]);

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

  // Fetch user's playlists
  useEffect(() => {
    if (isLoggedin) {
      const fetchUserPlaylists = async () => {
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

      fetchUserPlaylists();
    }
  }, [backendUrl, isLoggedin]);

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
        await axios.post(`${backendUrl}/api/songs/like`, {
          userId,
          songId,
        });
        setLikedSongs((prevLiked) => new Set(prevLiked).add(songId));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status. Please try again.");
    }
  };

  // Remove song from playlist (Only for owner)
  const removeSongFromPlaylist = async (songId, e) => {
    e.stopPropagation();

    try {
      await axios.put(
        `${backendUrl}/api/playlists/${id}/remove-song`,
        { songId },
        { withCredentials: true }
      );

      // Update the playlist locally
      setPlaylist((prev) => ({
        ...prev,
        songs: prev.songs.filter((song) => song._id !== songId),
      }));

      toast.success("Song removed from playlist.");
    } catch (error) {
      console.error("Error removing song from playlist:", error);
      toast.error("Failed to remove song. Please try again.");
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
      toast.success("Song added to playlist!");
      setShowModal(false);
    } catch (error) {
      console.error("Error adding to playlist:", error);
      toast.error("Failed to add song to playlist. Please try again.");
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
      toast.success("New playlist created and song added!");
      setShowModal(false);
      setNewPlaylistName("");
    } catch (error) {
      console.error("Error creating playlist:", error);
      toast.error("Failed to create playlist. Please try again.");
    }
  };

  if (!playlist) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="playlist-song-page">
        <h2 className="playlist-song-title">{playlist.name}</h2>
        <section className="playlist-song-section playlist-song-releases">
          <div className="playlist-song-section-header">
            <h2>Playlist Songs</h2>
          </div>

          {/* Songs Grid */}
          <div className="playlist-song-songs-grid">
            {playlist.songs.map((song) => (
              <motion.div
                key={song._id}
                className="playlist-song-card playlist-song-recent-card"
                whileHover={{ scale: 1.05 }}
                onClick={() => handlePlaySong(song)}
              >
                <div className="playlist-song-artwork">
                  <img
                    src={`${backendUrl}${song.coverImage}`}
                    alt={song.title}
                    className="playlist-song-cover-art"
                  />
                  <div className="playlist-song-play-overlay">
                    <p className="playlist-song-fas fa-play">▶</p>
                  </div>
                </div>
                <div className="playlist-song-details">
                  <h3 className="playlist-song-title">{song.title}</h3>
                  <Link
                    to={`/profile/${song.artistId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="playlist-song-artist"
                  >
                    {song.artist}
                  </Link>
                </div>
                <div className="playlist-song-actions">
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
                          className="playlist-song-fas fa-plus"
                        />
                      </button>
                    </>
                  )}
                  <button onClick={(e) => handleAddToQueue(song, e)}>
                    <img src={assets.add_queue_icon} alt="Add to queue" />
                  </button>
                  {userData?.userId === playlist.owner && (
                    <button
                      onClick={(e) => removeSongFromPlaylist(song._id, e)}
                    >
                      <img
                        src={assets.delete_icon}
                        alt="Remove from playlist"
                      />
                    </button>
                  )}
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

export default PlaylistSongsPage;
