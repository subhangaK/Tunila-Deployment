import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import "../css/AdminDashboard.css"; // Ensure you have this CSS file
import { toast } from "react-toastify";

const AdminDashboard = () => {
  const { 
    backendUrl, 
    userData, 
    allUsers, 
    allSongs, 
    fetchUsers, 
    fetchSongs, 
    deleteUser, 
    deleteSong 
  } = useContext(AppContext);

  const [searchQuery, setSearchQuery] = useState(""); // Search state

  // Fetch users and songs when the component loads
  useEffect(() => {
    if (userData?.role === "admin") {
      fetchUsers();
      fetchSongs();
    }
  }, [userData]);

  // Ensure only admin users can access this page
  if (!userData || userData.role !== "admin") {
    return <div className="admin-container"><h2>Access Denied</h2></div>;
  }

  // Filter users and songs based on search query
  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSongs = allSongs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle delete user confirmation
  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(userId);
      toast.success("User deleted!");
    }
  };

  // Handle delete song confirmation
  const handleDeleteSong = (songId) => {
    if (window.confirm("Are you sure you want to delete this song?")) {
      deleteSong(songId);
      toast.success("Song deleted!");
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search users or songs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="admin-search-input"
      />

      {/* USERS MANAGEMENT SECTION */}
      <div className="admin-section">
        <h2>Manage Users</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button 
                    className="admin-btn delete-btn" 
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    Delete User
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SONGS MANAGEMENT SECTION */}
      <div className="admin-section">
        <h2>Manage Songs</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cover</th>
              <th>Title</th>
              <th>Artist</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSongs.map((song) => (
              <tr key={song._id}>
                <td>
                  <img 
                    src={`${backendUrl}${song.coverImage}`} 
                    alt={song.title} 
                    className="song-cover-img"
                  />
                </td>
                <td>{song.title}</td>
                <td>{song.artist}</td>
                <td>
                  <button 
                    className="admin-btn delete-btn" 
                    onClick={() => handleDeleteSong(song._id)}
                  >
                    Delete Song
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AdminDashboard;
