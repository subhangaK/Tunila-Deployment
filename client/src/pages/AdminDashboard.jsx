import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
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
  const [loading, setLoading] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const replyTextAreaRef = useRef(null);

  // Fetch data based on active tab
  useEffect(() => {
    if (userData?.role === "admin") {
      const fetchData = async () => {
        setLoading(true);
        try {
          if (activeTab === "users") await fetchUsers();
          else if (activeTab === "songs") await fetchSongs();
          else if (activeTab === "contacts") await fetchContactMessages();
        } catch (error) {
          toast.error(`Failed to load ${activeTab} data`);
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [userData, activeTab]);

  const fetchContactMessages = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/contact/messages`, {
        credentials: "include", // This sends cookies with the request
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please log in again");
          // Optionally redirect to login
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAllContacts(data.messages || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch messages");
      console.error("Fetch messages error:", error);
    }
  };

  // Calculate song counts per user
  const userSongCounts = useMemo(() => {
    const counts = {};
    allSongs.forEach((song) => {
      const artistId = song.artistId?.toString();
      if (artistId) counts[artistId] = (counts[artistId] || 0) + 1;
    });
    return counts;
  }, [allSongs]);

  // Filter data based on search query
  const filteredUsers = useMemo(
    () =>
      allUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.role?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [allUsers, searchQuery]
  );

  const filteredSongs = useMemo(
    () =>
      allSongs.filter(
        (song) =>
          song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [allSongs, searchQuery]
  );

  const filteredContacts = useMemo(
    () =>
      allContacts.filter(
        (contact) =>
          contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.message?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [allContacts, searchQuery]
  );

  // Delete handlers
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Delete user "${userName}"? This cannot be undone.`)) {
      try {
        await deleteUser(userId);
        toast.success(`User "${userName}" deleted`);
      } catch (error) {
        toast.error(`Failed to delete user: ${error.message}`);
      }
    }
  };

  const handleDeleteSong = async (songId, songTitle) => {
    if (window.confirm(`Delete song "${songTitle}"? This cannot be undone.`)) {
      try {
        await deleteSong(songId);
        toast.success(`Song "${songTitle}" deleted`);
      } catch (error) {
        toast.error(`Failed to delete song: ${error.message}`);
      }
    }
  };

  // Updated handleSendReply function
  const handleSendReply = async (messageId) => {
    const replyMessage = replyTextAreaRef.current?.value;
    if (!replyMessage?.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    try {
      const response = await fetch(
        `${backendUrl}/api/contact/reply/${messageId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Send cookies
          body: JSON.stringify({ replyMessage }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Reply sent successfully");
        await fetchContactMessages();
        replyTextAreaRef.current.value = "";
      } else {
        toast.error(data.message || "Failed to send reply");
      }
    } catch (error) {
      toast.error("Network error while sending reply");
    }
  };

  const handleDeactivateUser = async (userId, userName) => {
    if (
      window.confirm(
        `Deactivate user "${userName}"? They won't be able to log in.`
      )
    ) {
      try {
        const response = await fetch(
          `${backendUrl}/api/admin/users/deactivate/${userId}`,
          {
            method: "PUT",
            credentials: "include",
          }
        );

        const data = await response.json();
        if (response.ok) {
          toast.success(data.message || "User deactivated successfully");
          await fetchUsers();
        } else {
          toast.error(data.message || "Failed to deactivate user");
        }
      } catch (error) {
        toast.error("Network error while deactivating user");
      }
    }
  };

  const handleReactivateUser = async (userId, userName) => {
    if (
      window.confirm(
        `Reactivate user "${userName}"? They will be able to log in again.`
      )
    ) {
      try {
        const response = await fetch(
          `${backendUrl}/api/admin/users/reactivate/${userId}`,
          {
            method: "PUT",
            credentials: "include",
          }
        );

        const data = await response.json();
        if (response.ok) {
          toast.success(data.message || "User reactivated successfully");
          await fetchUsers();
        } else {
          toast.error(data.message || "Failed to reactivate user");
        }
      } catch (error) {
        toast.error("Network error while reactivating user");
      }
    }
  };

  // Play song handler
  const handlePlaySong = (song) => {
    setCurrentTrack(song);
    addToQueue(song);
    toast.success(`"${song.title}" added to queue`);
  };

  // Access control
  if (!userData || userData.role !== "admin") {
    return (
      <div className="admin-access-denied">
        <div className="admin-access-denied-icon">⚠️</div>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

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
            <div className="admin-stat-item">
              <span className="admin-stat-value">{allContacts.length}</span>
              <span className="admin-stat-label">Messages</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-container">
        {/* Search and Tabs */}
        <div className="admin-controls">
          <div className="admin-search-container">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="admin-tabs">
            {["users", "songs", "contacts"].map((tab) => (
              <button
                key={tab}
                className={`admin-tab-button ${
                  activeTab === tab ? "admin-active" : ""
                }`}
                onClick={() => setActiveTab(tab)}
              >
                <span className="admin-tab-icon"></span>
                {tab === "users" && "Manage Users"}
                {tab === "songs" && "Manage Songs"}
                {tab === "contacts" && "Contact Messages"}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-content">
          {loading ? (
            <div className="admin-loading">
              <div className="admin-loading-spinner"></div>
              <p>Loading {activeTab} data...</p>
            </div>
          ) : (
            <>
              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="admin-section">
                  <div className="admin-section-header">
                    <h2 className="admin-section-title">Users</h2>
                    <span className="admin-count-badge">
                      {filteredUsers.length}{" "}
                      {filteredUsers.length === 1 ? "user" : "users"}
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
                                  e.target.src = assets.default_avatar;
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
                                {userSongCounts[user._id]
                                  ? "Artist"
                                  : user.role}
                              </span>
                            </div>
                            <div className="admin-user-stats">
                              <div className="admin-user-stat">
                                <span className="admin-user-stat-label">
                                  Songs
                                </span>
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
                            {user.isActive ? (
                              <button
                                className="admin-deactivate-button"
                                onClick={() =>
                                  handleDeactivateUser(user._id, user.name)
                                }
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                className="admin-reactivate-button"
                                onClick={() =>
                                  handleReactivateUser(user._id, user.name)
                                }
                              >
                                Reactivate
                              </button>
                            )}
                            <button
                              className="admin-delete-button"
                              onClick={() =>
                                handleDeleteUser(user._id, user.name)
                              }
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

              {/* Songs Tab */}
              {activeTab === "songs" && (
                <div className="admin-section">
                  <div className="admin-section-header">
                    <h2 className="admin-section-title">Songs</h2>
                    <span className="admin-count-badge">
                      {filteredSongs.length}{" "}
                      {filteredSongs.length === 1 ? "song" : "songs"}
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
                            <th className="admin-song-actions-header">
                              Actions
                            </th>
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
                                    e.target.src = assets.default_song_cover;
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
                                    onClick={() => handlePlaySong(song)}
                                  >
                                    <span className="admin-play-icon">▶</span>
                                  </button>
                                  <button
                                    className="admin-song-delete-button"
                                    onClick={() =>
                                      handleDeleteSong(song._id, song.title)
                                    }
                                  >
                                    <span className="admin-delete-icon">✖</span>
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

              {/* Contacts Tab */}
              {activeTab === "contacts" && (
                <div className="admin-section">
                  <div className="admin-section-header">
                    <h2 className="admin-section-title">Contact Messages</h2>
                    <span className="admin-count-badge">
                      {filteredContacts.length}{" "}
                      {filteredContacts.length === 1 ? "message" : "messages"}
                    </span>
                  </div>

                  {filteredContacts.length > 0 ? (
                    <div className="admin-contacts-list">
                      {filteredContacts.map((message) => (
                        <div key={message._id} className="contact-message-card">
                          <div className="message-header">
                            <div className="user-info">
                              {message.user?.profilePicture && (
                                <img
                                  src={`${backendUrl}${message.user.profilePicture}`}
                                  alt={message.name}
                                  className="user-avatar"
                                  onError={(e) => {
                                    e.target.src = assets.default_avatar;
                                  }}
                                />
                              )}
                              <div>
                                <h4>{message.name}</h4>
                                <p>{message.email}</p>
                                {message.user && (
                                  <p className="user-id">
                                    User ID: {message.user._id}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="message-meta">
                              <span className="message-date">
                                {new Date(
                                  message.createdAt
                                ).toLocaleDateString()}
                              </span>
                              <span className="message-subject">
                                {message.subject}
                              </span>
                            </div>
                          </div>

                          <div className="message-content">
                            <p>{message.message}</p>

                            {message.adminReply ? (
                              <div className="admin-reply">
                                <h5>Admin Response:</h5>
                                <p>{message.adminReply.message}</p>
                                <small>
                                  Replied on:{" "}
                                  {new Date(
                                    message.adminReply.repliedAt
                                  ).toLocaleString()}
                                </small>
                              </div>
                            ) : (
                              <div className="reply-section">
                                <textarea
                                  ref={replyTextAreaRef}
                                  placeholder="Type your reply here..."
                                  rows="3"
                                />
                                <button
                                  onClick={() => handleSendReply(message._id)}
                                  className="reply-button"
                                >
                                  Send Reply
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty-state">
                      <div className="admin-empty-icon">📩</div>
                      <p>No contact messages found</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to format numbers
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num;
};

export default AdminDashboard;
