import React, { useEffect, useState, useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import "../css/AdminDashboard.css";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const AdminDashboard = ({ setCurrentTrack }) => {
  const {
    backendUrl,
    userData,
    allUsers,
    allSongs,
    fetchUsers,
    fetchSongs,
    deleteUser,
    deleteSong,
    addToQueue,
  } = useContext(AppContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);

  // Fetch users and songs when the component loads
  useEffect(() => {
    if (userData?.role === "admin") {
      const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchUsers(), fetchSongs()]);
        setLoading(false);
      };
      fetchData();
    }
  }, [userData, fetchUsers, fetchSongs]);

  // Calculate song counts per user using artistId
  const userSongCounts = useMemo(() => {
    const counts = {};
    allSongs.forEach((song) => {
      const artistId = song.artistId?.toString(); // Ensure consistent type comparison
      if (artistId) {
        counts[artistId] = (counts[artistId] || 0) + 1;
      }
    });
    return counts;
  }, [allSongs]);

  // Ensure only admin users can access this page
  if (!userData || userData.role !== "admin") {
    return (
      <div className="admin-access-denied">
        <div className="admin-access-denied-icon">⚠️</div>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  // Filter users based on search query
  const filteredUsers = allUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter songs based on search query
  const filteredSongs = allSongs.filter(
    (song) =>
      song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle delete user confirmation
  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      deleteUser(userId);
      toast.success(`User "${userName}" deleted successfully!`);
    }
  };

  // Handle delete song confirmation
  const handleDeleteSong = (songId, songTitle) => {
    if (
      window.confirm(`Are you sure you want to delete song "${songTitle}"?`)
    ) {
      deleteSong(songId);
      toast.success(`Song "${songTitle}" deleted successfully!`);
    }
  };

  const handlePlaySong = (song) => {
    setCurrentTrack(song);
    addToQueue(song);
  };

  return (
    <div className="admin-page">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-title">Admin Dashboard</h1>
          <div className="admin-stats">
            <div className="admin-stat-item">
              <span className="admin-stat-value">{allUsers.length}</span>
              <span className="admin-stat-label">Users</span>
            </div>
            <div className="admin-stat-item">
              <span className="admin-stat-value">{allSongs.length}</span>
              <span className="admin-stat-label">Songs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-container">
        {/* Search and Tabs Navigation */}
        <div className="admin-controls">
          <div className="admin-search-container">
            <input
              type="text"
              placeholder="Search users or songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="admin-tabs">
            <button
              className={`admin-tab-button ${
                activeTab === "users" ? "admin-active" : ""
              }`}
              onClick={() => setActiveTab("users")}
            >
              <span className="admin-tab-icon"></span>
              Manage Users
            </button>
            <button
              className={`admin-tab-button ${
                activeTab === "songs" ? "admin-active" : ""
              }`}
              onClick={() => setActiveTab("songs")}
            >
              <span className="admin-tab-icon"></span>
              Manage Songs
            </button>
          </div>
        </div>

        <div className="admin-content">
          {/* USERS MANAGEMENT SECTION */}
          {activeTab === "users" && (
            <div className="admin-section">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Users</h2>
                <span className="admin-count-badge">
                  {filteredUsers.length} users
                </span>
              </div>

              {filteredUsers.length > 0 ? (
                <div className="admin-users-grid">
                  {filteredUsers.map((user) => (
                    <div key={user._id} className="admin-user-card">
                      <div className="admin-user-header">
                        <div className="admin-user-avatar">
                          <img
                            src={`${backendUrl}${
                              user.profilePicture || assets.default_avatar
                            }`}
                            alt={user.name}
                            onError={(e) => {
                              e.target.src =
                                assets.default_avatar || "/default-avatar.png";
                            }}
                          />
                        </div>
                        <div className="admin-user-info">
                          <h3 className="admin-user-name">
                            {user.name}
                            {user.isAccountVerified && (
                              <span
                                className="admin-verified-badge"
                                title="Verified Account"
                              >
                                ✓
                              </span>
                            )}
                          </h3>
                          <p className="admin-user-email">{user.email}</p>
                        </div>
                      </div>
                      <div className="admin-user-details">
                        <div className="admin-user-role">
                          <span
                            className={`admin-role-badge ${
                              userSongCounts[user._id]
                                ? "admin-role-artist"
                                : `admin-role-${user.role}`
                            }`}
                          >
                            {userSongCounts[user._id] ? "Artist" : user.role}
                          </span>
                        </div>
                        <div className="admin-user-stats">
                          <div className="admin-user-stat">
                            <span className="admin-user-stat-label">Songs</span>
                            <span className="admin-user-stat-value">
                              {userSongCounts[user._id] || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="admin-user-actions">
                        <button
                          className="admin-view-button"
                          onClick={() =>
                            window.open(`/profile/${user._id}`, "_blank")
                          }
                        >
                          View Profile
                        </button>
                        <button
                          className="admin-delete-button"
                          onClick={() => handleDeleteUser(user._id, user.name)}
                        >
                          Delete User
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state">
                  <div className="admin-empty-icon">👥</div>
                  <p>No users found matching your search.</p>
                </div>
              )}
            </div>
          )}

          {/* SONGS MANAGEMENT SECTION */}
          {activeTab === "songs" && (
            <div className="admin-section">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Songs</h2>
                <span className="admin-count-badge">
                  {filteredSongs.length} songs
                </span>
              </div>

              {filteredSongs.length > 0 ? (
                <div className="admin-songs-table">
                  <table>
                    <thead>
                      <tr>
                        <th className="admin-song-cover-header">Cover</th>
                        <th className="admin-song-title-header">Title</th>
                        <th className="admin-song-artist-header">Artist</th>
                        <th className="admin-song-genre-header">Genre</th>
                        <th className="admin-song-likes-header">Likes</th>
                        <th className="admin-song-actions-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSongs.map((song) => (
                        <tr key={song._id} className="admin-song-row">
                          <td className="admin-song-cover-cell">
                            <img
                              src={`${backendUrl}${song.coverImage}`}
                              alt={song.title}
                              className="admin-song-cover"
                              onError={(e) => {
                                e.target.src =
                                  assets.default_song_cover ||
                                  "/default-song.jpg";
                              }}
                            />
                          </td>
                          <td className="admin-song-title-cell">
                            {song.title}
                          </td>
                          <td className="admin-song-artist-cell">
                            {song.artist}
                          </td>
                          <td className="admin-song-genre-cell">
                            <span className="admin-genre-tag">
                              {song.genre}
                            </span>
                          </td>
                          <td className="admin-song-likes-cell">
                            <div className="admin-likes-display">
                              <span className="admin-heart-icon">❤️</span>
                              <span className="admin-likes-count">
                                {formatNumber(song.likedBy?.length || 0)}
                              </span>
                            </div>
                          </td>
                          <td className="admin-song-actions-cell">
                            <div className="admin-song-actions">
                              <button
                                className="admin-song-play-button"
                                onClick={() => setCurrentTrack(song)}
                              >
                                <span className="admin-play-icon">▶</span>
                              </button>
                              <button
                                className="admin-song-delete-button"
                                onClick={() =>
                                  handleDeleteSong(song._id, song.title)
                                }
                              >
                                <span className="admin-delete-icon">
                                  <img
                                    className="admin-delete-icon"
                                    src={assets.delete_icon}
                                    alt=""
                                  />
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="admin-empty-state">
                  <div className="admin-empty-icon">🎵</div>
                  <p>No songs found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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

export default AdminDashboard;
