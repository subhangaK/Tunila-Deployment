import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import "../css/Body.css";
import "../css/PlaylistModel.css";

const Body = ({ setCurrentTrack, filteredSongs }) => {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [likedSongs, setLikedSongs] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [randomSongs, setRandomSongs] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);

  const {
    backendUrl,
    isLoggedin,
    userData,
    recommendedSongs,
    fetchRecommendedSongs,
    addToQueue,
  } = useContext(AppContext);

  const userId = userData?.userId;

  // Fetch songs with improved error handling
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/songs`);
        const fetchedSongs = response.data.songs;
        const shuffledSongs = [...fetchedSongs].sort(() => Math.random() - 0.5);
        setSongs(fetchedSongs);
        setRandomSongs(shuffledSongs.slice(0, 12));
      } catch (error) {
        console.error("Error fetching songs:", error);
        toast.error("Failed to load songs.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };
    fetchSongs();
  }, [backendUrl]);

  // Function to handle song play
  const handlePlaySong = (song) => {
    setCurrentTrack(song);
    addToQueue(song);
  };

  // Fetch recommended songs when userData is available
  useEffect(() => {
    if (isLoggedin && userId) {
      fetchRecommendedSongs(userId);
    }
  }, [userId, fetchRecommendedSongs, isLoggedin]);

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
      toast.error("Failed to update like status. Please try again.");
    }
  };

  // Updated Featured Artists
  useEffect(() => {
    const fetchFeaturedArtists = async () => {
      try {
        const songsResponse = await axios.get(`${backendUrl}/api/songs`);
        const allSongs = songsResponse.data.songs;
        const artistIds = [...new Set(allSongs.map((song) => song.artistId))];

        const artistsData = await Promise.all(
          artistIds.map(async (artistId) => {
            try {
              const userResponse = await axios.get(
                `${backendUrl}/api/user/profile/${artistId}`
              );
              return {
                artistId,
                name: userResponse.data.userProfile.name,
                profilePicture:
                  userResponse.data.userProfile.profilePicture ||
                  assets.default_profile,
              };
            } catch (error) {
              console.error("Error fetching artist data:", error);
              return null;
            }
          })
        );

        const validArtists = artistsData.filter((artist) => artist !== null);
        const shuffledArtists = validArtists
          .sort(() => 0.5 - Math.random())
          .slice(0, 10);

        setFeaturedArtists(shuffledArtists);
      } catch (error) {
        console.error("Error fetching featured artists:", error);
      }
    };

    fetchFeaturedArtists();
  }, [backendUrl]);

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

  // Fetch public playlists
  useEffect(() => {
    const fetchPublicPlaylists = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/playlists/public`);
        const filteredPlaylists = response.data.playlists.filter(
          (playlist) => playlist.owner !== userData?.userId
        );
        setPublicPlaylists(filteredPlaylists);
      } catch (error) {
        console.error("Error fetching public playlists:", error);
        toast.error("Failed to load public playlists.");
      }
    };

    fetchPublicPlaylists();
  }, [backendUrl, userData]);

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
  const createPlaylist = async (e) => {
    e.preventDefault();

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

  // Handle queue addition
  const handleAddToQueue = (song, e) => {
    e.stopPropagation();
    addToQueue(song);
    toast.success(`Added "${song.title}" to queue`, {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  return (
    <div className="tunila-home-body">
      {/* Action Buttons */}
      <div className="tunila-action-container">
        <div className="tunila-greeting">
          <h2>
            Good {getTimeOfDay()}, {userData?.name || "Music Lover"}!
          </h2>
          <p>What would you like to listen to today?</p>
        </div>

        {isLoggedin && (
          <div className="tunila-action-buttons">
            <Link to="/upload-music" className="tunila-upload-btn">
              <i className="fas fa-cloud-upload-alt"></i> Upload Music
            </Link>
            <Link to="/playlists" className="tunila-playlist-btn">
              <i className="fas fa-list"></i> My Playlists
            </Link>
            <Link to="/liked-songs" className="tunila-liked-btn">
              <img src={assets.liked_icon} alt="Liked Songs" />
            </Link>
          </div>
        )}
      </div>

      {/* Recommended Songs Section */}
      {recommendedSongs.length > 0 && isLoggedin && (
        <section className="tunila-section">
          <div className="tunila-section-header">
            <h2>Recommended For You</h2>
            <Link to="/recommendations" className="tunila-see-all">
              See All
            </Link>
          </div>

          <div className="tunila-songs-carousel">
            {recommendedSongs.map((song) => (
              <motion.div
                key={song._id}
                className="tunila-song-card"
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                onClick={() => setCurrentTrack(song)}
              >
                <div className="tunila-song-artwork">
                  <img
                    src={`${backendUrl}${song.coverImage}`}
                    alt={song.title}
                    className="tunila-cover-art"
                  />
                  <div className="tunila-play-overlay">
                    <p className="fas fa-play">▶</p>
                  </div>
                </div>
                <div className="tunila-song-details">
                  <h3 className="tunila-song-title">{song.title}</h3>
                  <Link
                    to={`/profile/${song.artistId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="tunila-song-artist"
                  >
                    {song.artist}
                  </Link>
                </div>
                <div className="tunila-song-actions">
                  {isLoggedin && (
                    <>
                      <button
                        className="tunila-like-btn"
                        onClick={(e) => handleLikeToggle(song._id, e)}
                      >
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
                        className="tunila-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSong(song);
                          setShowModal(true);
                        }}
                      >
                        <img
                          src={assets.add_icon}
                          alt="Add to queue"
                          className="fas fa-plus"
                        />
                      </button>
                    </>
                  )}
                  <button
                    className="tunila-queue-btn"
                    onClick={(e) => handleAddToQueue(song, e)}
                  >
                    <img src={assets.add_queue_icon} alt="Add to queue" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Tracks */}
      <section className="tunila-section">
        <div className="tunila-section-header">
          <h2>Featured Tunes</h2>
          <Link to="/published-music" className="tunila-see-all">
            Browse All
          </Link>
        </div>

        <div className="tunila-featured-grid">
          {randomSongs.slice(0, 6).map((song, index) => (
            <motion.div
              key={song._id}
              className={`tunila-featured-card ${
                index === 0 ? "tunila-featured-main" : ""
              }`}
              whileHover={{ scale: 1.02 }}
              onClick={() => setCurrentTrack(song)}
            >
              <div className="tunila-featured-artwork">
                <img
                  src={`${backendUrl}${song.coverImage}`}
                  alt={song.title}
                  className="tunila-featured-cover"
                />
                <div className="tunila-featured-gradient"></div>
                <div className="tunila-play-button">
                  <p className="fas fa-play">▶</p>
                </div>
              </div>
              <div className="tunila-featured-info">
                <h3>{song.title}</h3>
                <Link
                  to={`/profile/${song.artistId}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {song.artist}
                </Link>
                <div className="tunila-featured-actions">
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
                          className="tunila-icon-sm"
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
                          alt="Add to queue"
                          className="fas fa-plus tunila-icon-sm"
                        />
                      </button>
                    </>
                  )}
                  <button onClick={(e) => handleAddToQueue(song, e)}>
                    <img
                      src={assets.add_queue_icon}
                      alt="Add to queue"
                      className="tunila-icon-sm"
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="tunila-more-link">
          <Link to="/published-music">
            Explore More Tunes <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </section>

      {/* Recent Releases */}
      <section className="tunila-section tunila-recent-releases">
        <div className="tunila-section-header">
          <h2>Recent Releases</h2>
        </div>

        <div className="tunila-songs-carousel">
          {randomSongs.slice(2, 12).map((song) => (
            <motion.div
              key={song._id}
              className="tunila-song-card tunila-recent-card"
              whileHover={{ scale: 1.05 }}
              onClick={() => setCurrentTrack(song)}
            >
              <div className="tunila-song-artwork">
                <img
                  src={`${backendUrl}${song.coverImage}`}
                  alt={song.title}
                  className="tunila-cover-art"
                />
                <div className="tunila-play-overlay">
                  <p className="fas fa-play">▶</p>
                </div>
              </div>
              <div className="tunila-song-details">
                <h3 className="tunila-song-title">{song.title}</h3>
                <Link
                  to={`/profile/${song.artistId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="tunila-song-artist"
                >
                  {song.artist}
                </Link>
              </div>
              <div className="tunila-song-actions">
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
                        alt="Add to queue"
                        className="fas fa-plus"
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

      {/* Featured Artists Section */}
      <section className="tunila-artists-section">
        <div className="tunila-section-header">
          <h2>Featured Artists</h2>
          <Link to="/featured-artists" className="tunila-see-all">
            See All
          </Link>
        </div>

        <div className="tunila-artists-container">
          {featuredArtists.length > 0 ? (
            featuredArtists.map((artist) => (
              <Link
                key={artist.artistId}
                to={`/profile/${artist.artistId}`}
                className="tunila-artist-card"
              >
                <motion.div
                  className="tunila-artist-avatar"
                  whileHover={{ scale: 1.05 }}
                >
                  <img
                    src={`${backendUrl}${artist.profilePicture}`}
                    alt={artist.name}
                  />
                </motion.div>
                <h3 className="tunila-artist-name">{artist.name}</h3>
              </Link>
            ))
          ) : (
            <p className="tunila-empty-message">
              No featured artists available.
            </p>
          )}
        </div>
      </section>

      {/* Public Playlists Section */}
      <section className="tunila-playlists-section">
        <div className="tunila-section-header">
          <h2>Popular Playlists</h2>
          <Link to="/public-playlists" className="tunila-see-all">
            Browse All
          </Link>
        </div>

        <div className="tunila-playlists-grid">
          {publicPlaylists.slice(0, 6).map((playlist) => (
            <motion.div
              key={playlist._id}
              className="tunila-playlist-card"
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
              onClick={() =>
                (window.location.href = `/playlists/${playlist._id}`)
              }
            >
              <div className="tunila-playlist-artwork">
                <img
                  src={`${backendUrl}${playlist.coverImage}`}
                  alt={playlist.name}
                  className="tunila-playlist-cover"
                />
                <div className="tunila-playlist-overlay">
                  <i className="fas fa-play"></i>
                </div>
              </div>
              <div className="tunila-playlist-info">
                <h3>{playlist.name}</h3>
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
  );
};

// Helper function to get time of day greeting
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
};

export default Body;
