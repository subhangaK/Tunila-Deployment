import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import Header from "../components/Header";
import "../css/UserProfilePage.css";
import { assets } from "../assets/assets"; // Import assets for icons

const UserProfilePage = () => {
  const { userId } = useParams();
  const { backendUrl, isLoggedin, userData } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/user/profile/${userId}`);
        setProfile(response.data.userProfile);
      } catch (error) {
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [backendUrl, userId]);

  // Handle cover image upload
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      const response = await axios.put(`${backendUrl}/api/user/profile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      setProfile((prev) => ({ ...prev, coverImage: response.data.userProfile.coverImage }));
      toast.success("Cover image updated successfully!");
    } catch (error) {
      toast.error("Failed to update cover image. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Header />
      <div className="user-profile">
        {/* Cover Image */}
        <div className="cover-image-container">
          <img src={`${backendUrl}${profile.coverImage}`} alt="Cover" className="cover-image" />
          {isLoggedin && userData?.userId === userId && (
            <label htmlFor="cover-upload" className="cover-upload-label">
              Change Cover
              <input
                type="file"
                id="cover-upload"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleCoverUpload}
              />
            </label>
          )}
        </div>

        {/* User Name */}
        <h1 className="username">
          {profile.name}
          {profile.isAccountVerified && <img src={assets.verified_icon} alt="Verified" className="verified-icon" />}
        </h1>

        {/* Uploaded Songs */}
        <h2>Uploaded Songs</h2>
        {profile.songs.length > 0 ? (
          <div className="songs-grid">
            {profile.songs.map((song) => (
              <div key={song._id} className="song-card">
                <img
                  src={`${backendUrl}${song.coverImage}`}
                  alt={song.title}
                  className="song-cover"
                />
                <div className="song-info">
                  <p className="song-title">{song.title}</p>
                  <p className="song-artist">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-content">No songs uploaded yet.</p>
        )}

        {/* Public Playlists */}
        <h2>Public Playlists</h2>
        {profile.playlists.length > 0 ? (
          <div className="playlists-grid">
            {profile.playlists.map((playlist) => (
              <div
                key={playlist._id}
                className="playlist-card"
                onClick={() => navigate(`/playlists/${playlist._id}`)}
              >
                <img src={`${backendUrl}${playlist.coverImage}`} alt={playlist.name} className="playlist-cover" />
                <div className="playlist-info">
                  <h3>{playlist.name}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-content">No public playlists yet.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
