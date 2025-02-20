import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import "../css/PlaylistsPage.css";
import Header from "../components/Header";
import { assets } from "../assets/assets";

const PlaylistsPage = () => {
  const { backendUrl, isLoggedin } = useContext(AppContext);
  const [playlists, setPlaylists] = useState([]);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [newName, setNewName] = useState("");
  const [newCover, setNewCover] = useState(null);

  const navigate = useNavigate();

  // Fetch playlists
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
        const errorMessage =
          error.response?.data?.message || "Failed to load playlists.";
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    if (isLoggedin) fetchPlaylists();
  }, [backendUrl, isLoggedin]);

  // Handle playlist update
  const handleUpdatePlaylist = async (playlistId) => {
    const formData = new FormData();
    if (newName) formData.append("name", newName);
    if (newCover) formData.append("coverImage", newCover);

    try {
      const response = await axios.put(
        `${backendUrl}/api/playlists/${playlistId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setPlaylists(
        playlists.map((playlist) =>
          playlist._id === playlistId ? response.data.playlist : playlist
        )
      );

      toast.success("Playlist updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setEditingPlaylist(null);
      setNewName("");
      setNewCover(null);
    } catch (error) {
      console.error("Error updating playlist:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update playlist.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Toggle playlist privacy
  const togglePlaylistPrivacy = async (playlistId, isPublic) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/playlists/${playlistId}`,
        { isPublic: !isPublic },
        { withCredentials: true }
      );

      setPlaylists(
        playlists.map((playlist) =>
          playlist._id === playlistId ? response.data.playlist : playlist
        )
      );

      toast.success(`Playlist is now ${!isPublic ? "Public" : "Private"}.`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error toggling playlist privacy:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to toggle privacy.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div>
      <Header />
      <div className="playlists-page">
        <h2>My Playlists</h2>

        <div className="playlists-grid">
          {playlists.map((playlist) => (
            <div
              key={playlist._id}
              className="playlist-card"
              onClick={() => {
                if (editingPlaylist !== playlist._id)
                  navigate(`/playlists/${playlist._id}`);
              }}
            >
              {editingPlaylist === playlist._id ? (
                <img
                  src={assets.add_cover}
                  alt="Add Cover"
                  className="add-cover-image"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card navigation
                    document
                      .querySelector(`#cover-input-${playlist._id}`)
                      .click();
                  }}
                />
              ) : (
                <img
                  src={`${backendUrl}${playlist.coverImage}`}
                  alt={playlist.name}
                  className="playlist-cover"
                />
              )}

              <div className="playlist-info">
                {editingPlaylist === playlist._id ? (
                  <div
                    onClick={(e) => e.stopPropagation()} // Prevent card navigation during editing
                  >
                    <input
                      type="text"
                      value={newName}
                      placeholder="New Playlist Name"
                      onChange={(e) => setNewName(e.target.value)}
                      className="playlist-edit-input"
                    />
                    <input
                      type="file"
                      id={`cover-input-${playlist._id}`}
                      style={{ display: "none" }}
                      onChange={(e) => setNewCover(e.target.files[0])}
                    />
                    <div className="privacy-toggle-container">
                      <span className="privacy-label">
                        {playlist.isPublic ? "Public" : "Private"}
                      </span>
                      <img
                        src={
                          playlist.isPublic
                            ? assets.switch_on_icon
                            : assets.switch_off_icon
                        }
                        alt={playlist.isPublic ? "Public" : "Private"}
                        className="privacy-toggle"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card navigation
                          togglePlaylistPrivacy(
                            playlist._id,
                            playlist.isPublic
                          );
                        }}
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card navigation
                        handleUpdatePlaylist(playlist._id);
                      }}
                      className="playlist-save-btn"
                    >
                      Save
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card navigation
                        setEditingPlaylist(null);
                      }}
                      className="playlist-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3>{playlist.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card navigation
                        setEditingPlaylist(playlist._id);
                      }}
                      className="playlist-edit-btn"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistsPage;
