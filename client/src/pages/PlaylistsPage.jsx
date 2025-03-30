import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import "../css/PlaylistsPage.css";
import { assets } from "../assets/assets";

const PlaylistsPage = () => {
  const { backendUrl, isLoggedin } = useContext(AppContext);
  const [playlists, setPlaylists] = useState([]);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [newName, setNewName] = useState("");
  const [newCover, setNewCover] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistCover, setNewPlaylistCover] = useState(null);
  const [newPlaylistPrivacy, setNewPlaylistPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
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

  // Delete a playlist
  const handleDeletePlaylist = async (playlistId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this playlist? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`${backendUrl}/api/playlists/${playlistId}`, {
        withCredentials: true,
      });

      // Remove the deleted playlist from the state
      setPlaylists(playlists.filter((playlist) => playlist._id !== playlistId));

      toast.success("Playlist deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error deleting playlist:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete playlist.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Create new playlist
  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error("Please enter a playlist name", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", newPlaylistName);
    formData.append("isPublic", newPlaylistPrivacy);
    if (newPlaylistCover) formData.append("coverImage", newPlaylistCover);

    try {
      // First create the playlist
      const createResponse = await axios.post(
        `${backendUrl}/api/playlists`,
        { name: newPlaylistName, isPublic: newPlaylistPrivacy },
        { withCredentials: true }
      );

      // If there's a cover image, update the playlist with it
      if (newPlaylistCover) {
        const updateFormData = new FormData();
        updateFormData.append("coverImage", newPlaylistCover);

        await axios.put(
          `${backendUrl}/api/playlists/${createResponse.data.playlist._id}`,
          updateFormData,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      // Refresh playlists
      const response = await axios.get(
        `${backendUrl}/api/playlists/my-playlists`,
        {
          withCredentials: true,
        }
      );
      setPlaylists(response.data.playlists);

      toast.success("Playlist created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowCreateModal(false);
      setNewPlaylistName("");
      setNewPlaylistCover(null);
      setNewPlaylistPrivacy(false);
    } catch (error) {
      console.error("Error creating playlist:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create playlist.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="playlist-page-container">
      <div className="playlist-page-header">
        <h2>My Playlists</h2>
        <button
          className="playlist-page-create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          Create New Playlist
        </button>
      </div>

      {isLoading ? (
        <div className="playlist-page-loading">
          <div className="playlist-page-spinner"></div>
          <p>Loading your playlists...</p>
        </div>
      ) : (
        <>
          {playlists.length === 0 ? (
            <div className="playlist-page-empty">
              <img
                src={assets.music_note_icon || "/placeholder-music-icon.png"}
                alt="No playlists"
                className="playlist-page-empty-icon"
              />
              <h3>You don't have any playlists yet</h3>
              <p>Create your first playlist to start organizing your music</p>
              <button
                className="playlist-page-first-create-btn"
                onClick={() => setShowCreateModal(true)}
              >
                Create My First Playlist
              </button>
            </div>
          ) : (
            <div className="playlist-page-grid">
              {playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  className="playlist-page-card"
                  onClick={() => {
                    if (editingPlaylist !== playlist._id)
                      navigate(`/playlists/${playlist._id}`);
                  }}
                >
                  <div className="playlist-page-cover-container">
                    {editingPlaylist === playlist._id ? (
                      <div className="playlist-page-edit-cover">
                        <img
                          src={
                            newCover
                              ? URL.createObjectURL(newCover)
                              : `${backendUrl}${playlist.coverImage}`
                          }
                          alt={playlist.name}
                          className="playlist-page-cover"
                        />
                        <div className="playlist-page-cover-overlay">
                          <img
                            src={assets.edit_icon}
                            alt="Change Cover"
                            className="playlist-page-change-cover-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              document
                                .querySelector(`#cover-input-${playlist._id}`)
                                .click();
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={`${backendUrl}${playlist.coverImage}`}
                        alt={playlist.name}
                        className="playlist-page-cover"
                      />
                    )}
                    <div className="playlist-page-song-count">
                      {playlist.songs?.length || 0} songs
                    </div>
                  </div>

                  <div className="playlist-page-info">
                    {editingPlaylist === playlist._id ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="playlist-page-edit-form"
                      >
                        <input
                          type="text"
                          value={newName}
                          placeholder={playlist.name}
                          onChange={(e) => setNewName(e.target.value)}
                          className="playlist-page-edit-input"
                        />
                        <input
                          type="file"
                          id={`cover-input-${playlist._id}`}
                          style={{ display: "none" }}
                          onChange={(e) => setNewCover(e.target.files[0])}
                          accept="image/*"
                        />
                        <div className="playlist-page-privacy-toggle">
                          <span className="playlist-page-privacy-label">
                            {playlist.isPublic ? "Public" : "Private"}
                          </span>
                          <div
                            className={`playlist-page-toggle ${
                              playlist.isPublic ? "playlist-page-toggle-on" : ""
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlaylistPrivacy(
                                playlist._id,
                                playlist.isPublic
                              );
                            }}
                          >
                            <div className="playlist-page-toggle-slider"></div>
                          </div>
                        </div>
                        <div className="playlist-page-edit-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdatePlaylist(playlist._id);
                            }}
                            className="playlist-page-save-btn"
                          >
                            Save
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPlaylist(null);
                              setNewName("");
                              setNewCover(null);
                            }}
                            className="playlist-page-cancel-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="playlist-page-display-info">
                        <h3>{playlist.name}</h3>
                        <div className="playlist-page-status">
                          <span
                            className={`playlist-page-visibility-badge ${
                              playlist.isPublic
                                ? "playlist-page-public"
                                : "playlist-page-private"
                            }`}
                          >
                            {playlist.isPublic ? "Public" : "Private"}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPlaylist(playlist._id);
                              setNewName(playlist.name);
                            }}
                            className="playlist-page-edit-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlaylist(playlist._id);
                            }}
                            className="playlist-page-delete-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div
          className="playlist-page-modal-backdrop"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="playlist-page-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Create New Playlist</h3>
            <div className="playlist-page-modal-content">
              <div className="playlist-page-cover-upload">
                <div
                  className="playlist-page-cover-preview"
                  onClick={() =>
                    document.getElementById("new-playlist-cover").click()
                  }
                >
                  {newPlaylistCover ? (
                    <img
                      src={URL.createObjectURL(newPlaylistCover)}
                      alt="Playlist Cover"
                    />
                  ) : (
                    <div className="playlist-page-cover-placeholder">
                      <span>+</span>
                      <p>Add Cover</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="new-playlist-cover"
                  style={{ display: "none" }}
                  onChange={(e) => setNewPlaylistCover(e.target.files[0])}
                  accept="image/*"
                />
              </div>

              <div className="playlist-page-form-group">
                <label htmlFor="playlist-name">Playlist Name</label>
                <input
                  type="text"
                  id="playlist-name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="My Awesome Playlist"
                  className="playlist-page-input"
                />
              </div>

              <div className="playlist-page-form-group">
                <label>Privacy Setting</label>
                <div className="playlist-page-privacy-setting">
                  <div className="playlist-page-privacy-option">
                    <input
                      type="radio"
                      id="private-option"
                      name="privacy"
                      checked={!newPlaylistPrivacy}
                      onChange={() => setNewPlaylistPrivacy(false)}
                    />
                    <label htmlFor="private-option">
                      <strong>Private</strong>
                      <span>Only you can see this playlist</span>
                    </label>
                  </div>

                  <div className="playlist-page-privacy-option">
                    <input
                      type="radio"
                      id="public-option"
                      name="privacy"
                      checked={newPlaylistPrivacy}
                      onChange={() => setNewPlaylistPrivacy(true)}
                    />
                    <label htmlFor="public-option">
                      <strong>Public</strong>
                      <span>Everyone can see this playlist</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="playlist-page-modal-actions">
              <button
                className="playlist-page-cancel-modal-btn"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                className="playlist-page-create-modal-btn"
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistName.trim()}
              >
                Create Playlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
