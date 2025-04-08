import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import Header from "../components/Header";
import "../css/UserProfilePage.css";
import { assets } from "../assets/assets";
import "../css/PlaylistModel.css";

const UserProfilePage = ({ setCurrentTrack }) => {
  const { userId } = useParams();
  const { backendUrl, isLoggedin, userData, addToQueue } =
    useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [likedSongs, setLikedSongs] = useState(new Set());
  const [playlists, setPlaylists] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("popular");
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/user/profile/${userId}`
        );
        setProfile(response.data.userProfile);
      } catch (error) {
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [backendUrl, userId]);

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const response = await axios.put(
        `${backendUrl}/api/user/profile`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      setProfile((prev) => ({
        ...prev,
        profilePicture: response.data.userProfile.profilePicture,
      }));
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile picture.");
    }
  };

  // Handle cover image upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      const response = await axios.put(
        `${backendUrl}/api/user/profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setProfile((prev) => ({
        ...prev,
        coverImage: response.data.userProfile.coverImage,
      }));
      toast.success("Cover image updated successfully!");
    } catch (error) {
      toast.error("Failed to update cover image. Please try again.");
    }
  };

  // Fetch liked songs
  useEffect(() => {
    if (isLoggedin && userData?.userId) {
      const fetchLikedSongs = async () => {
        try {
          const response = await axios.get(
            `${backendUrl}/api/songs/liked-songs/${userData.userId}`
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
  }, [backendUrl, isLoggedin, userData]);

  // Toggle like/unlike for a song
  const handleLikeToggle = async (songId, e) => {
    e?.stopPropagation();

    if (!isLoggedin) {
      toast.error("You must be logged in to like a song.");
      return;
    }

    const isLiked = likedSongs.has(songId);

    try {
      if (isLiked) {
        await axios.post(`${backendUrl}/api/songs/unlike`, {
          userId: userData.userId,
          songId,
        });
        setLikedSongs((prevLiked) => {
          const updated = new Set(prevLiked);
          updated.delete(songId);
          return updated;
        });
      } else {
        await axios.post(`${backendUrl}/api/songs/like`, {
          userId: userData.userId,
          songId,
        });
        setLikedSongs((prevLiked) => new Set(prevLiked).add(songId));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status. Please try again.");
    }
  };

  // Fetch user's playlists
  useEffect(() => {
    if (isLoggedin) {
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

      fetchPlaylists();
    }
  }, [backendUrl, isLoggedin]);

  // Create a new playlist and add the selected song
  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error("Please enter a playlist name");
      return;
    }

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

  useEffect(() => {
    const fetchPublicPlaylists = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/playlists/public`);
        const filtered = response.data.playlists.filter(
          (playlist) => playlist.owner === userId
        );
        setPublicPlaylists(filtered);
      } catch (error) {
        console.error("Error fetching public playlists:", error);
        toast.error("Failed to load public playlists.");
      }
    };

    fetchPublicPlaylists();
  }, [backendUrl, userId]);

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
      toast.error("Failed to add song to playlist.");
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );

  return (
    <div className="user-profile-page">
      {/* Hero Section with Glassmorphism */}
      <div className="profile-hero">
        <div className="profile-cover-wrapper">
          <img
            src={`${backendUrl}${profile.coverImage}`}
            alt="Cover"
            className="profile-cover-image"
          />
          <div className="profile-overlay"></div>

          {isLoggedin && userData?.userId === userId && (
            <label className="cover-upload-button">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                style={{ display: "none" }}
              />
              <span>Update Cover</span>
              <img src={assets.edit_icon} alt="Edit" />
            </label>
          )}
        </div>

        <div className="profile-info-container">
          <div className="profile-avatar-wrapper">
            <img
              src={`${backendUrl}${
                profile.profilePicture || assets.default_avatar
              }`}
              alt={profile.name}
              className="profile-avatar"
            />
            {isLoggedin && userData?.userId === userId && (
              <label className="avatar-edit-button">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  style={{ display: "none" }}
                />
                <div className="edit-overlay">
                  <img src={assets.edit_icon} alt="Edit" />
                </div>
              </label>
            )}
          </div>

          <div className="profile-details">
            <div className="profile-name-container">
              <h1 className="profile-name">{profile.name}</h1>
              {profile.isAccountVerified && (
                <img
                  src={assets.verified_icon}
                  alt="Verified"
                  className="verified-badge"
                />
              )}
            </div>
            <p className="profile-bio">
              {profile.songs && profile.songs.length > 0
                ? "Music Artist"
                : profile.isAccountVerified
                ? "Verified User"
                : "Tunila User"}
            </p>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{profile.songs?.length || 0}</span>
                <span className="stat-label">Songs</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {profile.songs?.reduce(
                    (total, song) => total + song.likedBy.length,
                    0
                  ) || 0}
                </span>
                <span className="stat-label">Likes</span>
              </div>
              {profile.followers && (
                <div className="stat-item">
                  <span className="stat-value">
                    {profile.followers?.length || 0}
                  </span>
                  <span className="stat-label">Followers</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="profile-content">
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === "popular" ? "active" : ""}`}
            onClick={() => setActiveTab("popular")}
          >
            Popular Songs
          </button>

          {/* Replace the All Songs button with this */}
          {isLoggedin && userData?.userId === userId ? (
            <button
              className={`tab-button ${activeTab === "manage" ? "active" : ""}`}
              onClick={() => setActiveTab("manage")}
            >
              Manage Songs
            </button>
          ) : (
            <button
              className={`tab-button ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Songs
            </button>
          )}

          <button
            className={`tab-button ${
              activeTab === "public-playlists" ? "active" : ""
            }`}
            onClick={() => setActiveTab("public-playlists")}
          >
            Public Playlists
          </button>

          {isLoggedin && userData?.userId === userId && (
            <button
              className={`tab-button ${activeTab === "stats" ? "active" : ""}`}
              onClick={() => setActiveTab("stats")}
            >
              Stats & Analytics
            </button>
          )}

          <a href={`/artist/${userId}/merch`}>
            <button
              className={`tab-button ${activeTab === "Store" ? "active" : ""}`}
            >
              Store
            </button>
          </a>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "popular" && (
            <div className="popular-songs-container">
              <h2 className="section-title">Popular Songs</h2>
              {profile.songs && profile.songs.length > 0 ? (
                <div className="songs-table-container">
                  <table className="songs-table">
                    <tbody>
                      {[...profile.songs]
                        .sort((a, b) => b.likedBy.length - a.likedBy.length)
                        .slice(0, 5)
                        .map((song, index) => (
                          <tr
                            key={song._id}
                            className="song-row"
                            onClick={() => setCurrentTrack(song)}
                          >
                            <td className="song-index">{index + 1}</td>
                            <td className="song-title-cell">
                              <div className="song-title-container">
                                <img
                                  src={`${backendUrl}${song.coverImage}`}
                                  alt={song.title}
                                  className="song-thumbnail"
                                />
                                <div className="song-title-details">
                                  <span className="song-title">
                                    {song.title}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="song-genre">
                              <span className="genre-tag">{song.genre}</span>
                            </td>
                            <td className="song-likes">
                              ♥ {formatNumber(song.likedBy.length)}
                            </td>
                            <td className="song-actions">
                              {isLoggedin && (
                                <>
                                  <button
                                    className={`action-button like-button ${
                                      likedSongs.has(song._id) ? "liked" : ""
                                    }`}
                                    onClick={(e) =>
                                      handleLikeToggle(song._id, e)
                                    }
                                    aria-label={
                                      likedSongs.has(song._id)
                                        ? "Unlike"
                                        : "Like"
                                    }
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
                                    className="action-button playlist-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedSong(song);
                                      setShowModal(true);
                                    }}
                                    aria-label="Add to playlist"
                                  >
                                    <img
                                      src={assets.add_icon}
                                      alt="Add to playlist"
                                    />
                                  </button>
                                </>
                              )}
                              <button
                                className="action-button queue-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToQueue(song);
                                  toast.success(
                                    `Added "${song.title}" to queue`
                                  );
                                }}
                                aria-label="Add to queue"
                              >
                                <img
                                  src={assets.add_queue_icon}
                                  alt="Add to queue"
                                />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <img
                    src={assets.music_note_icon || "/music-note-icon.svg"}
                    alt="No songs"
                  />
                  <p>No songs uploaded yet</p>
                  {isLoggedin && userData?.userId === userId && (
                    <button
                      className="upload-cta-button"
                      onClick={() => navigate("/upload-music")}
                    >
                      Upload Your First Track
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "all" && (
            <div className="all-songs-container">
              <h2 className="section-title">All Songs</h2>
              {profile.songs && profile.songs.length > 0 ? (
                <div className="songs-grid">
                  {profile.songs.map((song) => (
                    <div key={song._id} className="song-card">
                      <div
                        className="song-card-cover"
                        onClick={() => setCurrentTrack(song)}
                      >
                        <img
                          src={`${backendUrl}${song.coverImage}`}
                          alt={song.title}
                          className="song-card-image"
                        />
                        <div className="play-overlay">
                          <div className="play-icon">▶</div>
                        </div>
                      </div>
                      <div className="song-card-details">
                        <h3 className="song-card-title">{song.title}</h3>
                        <div className="song-card-meta">
                          <span className="song-card-genre">{song.genre}</span>
                          <span className="song-card-likes">
                            ♥ {formatNumber(song.likedBy.length)}
                          </span>
                        </div>
                        <div className="song-card-actions">
                          {isLoggedin && (
                            <>
                              <button
                                className={`card-action-btn ${
                                  likedSongs.has(song._id) ? "liked" : ""
                                }`}
                                onClick={() => handleLikeToggle(song._id)}
                                aria-label={
                                  likedSongs.has(song._id) ? "Unlike" : "Like"
                                }
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
                                className="card-action-btn"
                                onClick={() => {
                                  setSelectedSong(song);
                                  setShowModal(true);
                                }}
                                aria-label="Add to playlist"
                              >
                                <img src={assets.add_icon} alt="Playlist" />
                              </button>
                            </>
                          )}
                          <button
                            className="card-action-btn"
                            onClick={() => {
                              addToQueue(song);
                              toast.success(`Added "${song.title}" to queue`);
                            }}
                            aria-label="Add to queue"
                          >
                            <img src={assets.add_queue_icon} alt="Queue" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <img
                    src={assets.music_note_icon || "/music-note-icon.svg"}
                    alt="No songs"
                  />
                  <p>No songs uploaded yet</p>
                  {isLoggedin && userData?.userId === userId && (
                    <button
                      className="upload-cta-button"
                      onClick={() => navigate("/upload-music")}
                    >
                      Upload Your First Track
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "manage" &&
            isLoggedin &&
            userData?.userId === userId && (
              <div className="manage-songs-container">
                {profile.songs && profile.songs.length > 0 ? (
                  <div className="songs-table-container">
                    <table className="songs-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Title</th>
                          <th>Genre</th>
                          <th>Likes</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.songs.map((song, index) => (
                          <tr key={song._id} className="song-row">
                            <td className="song-index">{index + 1}</td>
                            <td className="song-title-cell">
                              <div className="song-title-container">
                                <img
                                  src={`${backendUrl}${song.coverImage}`}
                                  alt={song.title}
                                  className="song-thumbnail"
                                />
                                <div className="song-title-details">
                                  <span className="song-title">
                                    {song.title}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="song-genre">
                              <span className="genre-tag">{song.genre}</span>
                            </td>
                            <td className="song-likes">
                              ♥ {formatNumber(song.likedBy.length)}
                            </td>
                            <td className="song-actions">
                              <button
                                className="action-button delete-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSong(song);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <img src={assets.delete_icon} alt="Delete" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-state">
                    <img src={assets.music_note_icon} alt="No songs" />
                    <p>No songs uploaded yet</p>
                    <button
                      className="upload-cta-button"
                      onClick={() => navigate("/upload-music")}
                    >
                      Upload Your First Track
                    </button>
                  </div>
                )}
              </div>
            )}

          {activeTab === "public-playlists" && (
            <div className="public-playlists-container">
              {publicPlaylists.length > 0 ? (
                <div className="playlists-grid">
                  {publicPlaylists.map((playlist) => (
                    <div
                      key={playlist._id}
                      className="playlist-card"
                      onClick={() => navigate(`/playlists/${playlist._id}`)}
                    >
                      <div className="playlist-cover">
                        <img
                          src={`${backendUrl}${playlist.coverImage}`}
                          alt={playlist.name}
                          onError={(e) => {
                            e.target.src = assets.default_playlist;
                          }}
                        />
                        <div className="play-overlay">
                          <div className="play-icon">▶</div>
                        </div>
                      </div>
                      <div className="playlist-details">
                        <h3 className="playlist-name">{playlist.name}</h3>
                        <p className="playlist-stats">
                          {playlist.songs?.length || 0} songs •{" "}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <img src={assets.music_note_icon} alt="No playlists" />
                  <p>No public playlists created yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "stats" &&
            isLoggedin &&
            userData?.userId === userId && (
              <div className="stats-container">
                <h2 className="section-title">Your Statistics</h2>
                <div className="stats-cards">
                  <div className="stat-card total-likes">
                    <div className="stat-card-icon">❤️</div>
                    <div className="stat-card-content">
                      <h3>Total Likes</h3>
                      <p className="stat-card-value">
                        {formatNumber(
                          profile.songs?.reduce(
                            (total, song) => total + song.likedBy.length,
                            0
                          ) || 0
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="stat-card top-song">
                    <div className="stat-card-icon">🏆</div>
                    <div className="stat-card-content">
                      <h3>Top Song</h3>
                      {profile.songs && profile.songs.length > 0 ? (
                        <>
                          <p className="stat-card-value">
                            {
                              [...profile.songs].sort(
                                (a, b) => b.likedBy.length - a.likedBy.length
                              )[0]?.title
                            }
                          </p>
                          <p className="stat-card-trend">
                            {formatNumber(
                              [...profile.songs].sort(
                                (a, b) => b.likedBy.length - a.likedBy.length
                              )[0]?.likedBy.length || 0
                            )}{" "}
                            likes
                          </p>
                        </>
                      ) : (
                        <p className="stat-card-empty">No songs yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
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

      {showDeleteModal && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="confirmation-modal">
            <div className="modal-header">
              <h3>Delete Song</h3>
              <button onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to delete "{selectedSong?.title}"?</p>
              <div className="modal-actions">
                <button
                  className="cancel-button"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="confirm-delete-button"
                  onClick={async () => {
                    try {
                      await axios.delete(
                        `${backendUrl}/api/songs/${selectedSong._id}`,
                        {
                          withCredentials: true,
                        }
                      );
                      setProfile((prev) => ({
                        ...prev,
                        songs: prev.songs.filter(
                          (s) => s._id !== selectedSong._id
                        ),
                      }));
                      setShowDeleteModal(false);
                      toast.success("Song deleted successfully");
                    } catch (error) {
                      toast.error("Failed to delete song");
                    }
                  }}
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper functions
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num;
};

export default UserProfilePage;
