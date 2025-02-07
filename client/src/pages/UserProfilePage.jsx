import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import Header from "../components/Header";
import "../css/UserProfilePage.css";
import { assets } from "../assets/assets";

const UserProfilePage = ({ setCurrentTrack }) => {
  const { userId } = useParams();
  const { backendUrl, isLoggedin, userData } = useContext(AppContext);
  const [profile, setProfile] = useState(null);
  const [likedSongs, setLikedSongs] = useState(new Set());
  const [playlists, setPlaylists] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
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

  // Fetch liked songs
  useEffect(() => {
    if (isLoggedin && userData?.userId) {
      const fetchLikedSongs = async () => {
        try {
          const response = await axios.get(`${backendUrl}/api/songs/liked-songs/${userData.userId}`);
          setLikedSongs(new Set(response.data.likedSongs.map((song) => song._id)));
        } catch (error) {
          console.error("Error fetching liked songs:", error);
        }
      };

      fetchLikedSongs();
    }
  }, [backendUrl, isLoggedin, userData]);

  // Toggle like/unlike for a song
  const handleLikeToggle = async (songId) => {
    if (!isLoggedin) {
      toast.error("You must be logged in to like a song.");
      return;
    }

    const isLiked = likedSongs.has(songId);

    try {
      if (isLiked) {
        await axios.post(`${backendUrl}/api/songs/unlike`, { userId: userData.userId, songId });
        setLikedSongs((prevLiked) => {
          const updated = new Set(prevLiked);
          updated.delete(songId);
          return updated;
        });
      } else {
        await axios.post(`${backendUrl}/api/songs/like`, { userId: userData.userId, songId });
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
          const response = await axios.get(`${backendUrl}/api/playlists/my-playlists`, {
            withCredentials: true,
          });
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="UserProfilePage">
      <Header />
      <div className="user-profile">
        {/* Cover Image & User Name */}
        <div className="cover-image-container">
          <img src={`${backendUrl}${profile.coverImage}`} alt="Cover" className="cover-image" />
          <div className="artist-info">
            {profile.isAccountVerified && (
              <div className="verified-tag">
                Verified Artist <img src={assets.verified_icon} alt="Verified" className="verified-icon" />
              </div>
            )}
            <h1 className="username">{profile.name}</h1>
          </div>

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

        {/* Popular Songs Section */}
        {profile.songs.length > 0 && (
          <>
            <h2>Popular Songs from Artist</h2>
            <table className="songs-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Song Name</th>
                  <th>Genre</th>
                  <th>Likes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...profile.songs]
                  .sort((a, b) => b.likedBy.length - a.likedBy.length)
                  .slice(0, 5)
                  .map((song) => (
                    <tr key={song._id} onClick={() => setCurrentTrack(song)} className="clickable-row">
                      <td>
                        <img src={`${backendUrl}${song.coverImage}`} alt={song.title} className="table-song-cover" />
                      </td>
                      <td>{song.title}</td>
                      <td>{song.genre}</td>
                      <td>{song.likedBy.length}</td>
                      <td>
                        <img
                          src={likedSongs.has(song._id) ? assets.liked_icon : assets.notliked_icon}
                          alt="Like"
                          className="like-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeToggle(song._id);
                          }}
                        />
                        <img
                          src={assets.add_icon}
                          alt="Add to Playlist"
                          className="add-to-playlist-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSong(song);
                            setShowModal(true);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}

{showModal && (
        <div className="modal">
          <h3>Select a Playlist</h3>
          <div className="playlist-grid">
            {playlists.map((playlist) => (
              <div
                key={playlist._id}
                className="playlist-item"
                onClick={() => addToPlaylist(playlist._id)}
              >
                <img
                  src={`${backendUrl}${playlist.coverImage}`}
                  alt={playlist.name}
                  className="playlist-cover"
                />
                <p className="playlist-name">{playlist.name}</p>
              </div>
            ))}
          </div>
          <h4>Create New Playlist</h4>
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Enter playlist name"
          />
          <button onClick={createPlaylist}>Create Playlist</button>
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
      )}
    </div>
        {/* Uploaded Songs */}
        <h2>Uploaded Songs</h2>
        {profile.songs.length > 0 ? (
          <div className="songs-grid">
            {profile.songs.map((song) => (
              <div key={song._id} className="song-card" onClick={() => setCurrentTrack(song)}>
                <img src={`${backendUrl}${song.coverImage}`} alt={song.title} className="song-cover" />
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
    </div>
  );
};

export default UserProfilePage;
