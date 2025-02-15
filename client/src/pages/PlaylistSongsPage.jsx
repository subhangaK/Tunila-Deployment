import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/PlaylistSongsPage.css";
import Header from "../components/Header";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const PlaylistSongsPage = ({ setCurrentTrack }) => {
  const { id } = useParams(); // Get the playlist ID from the route parameters
  const [playlist, setPlaylist] = useState(null);
  const [likedSongs, setLikedSongs] = useState(new Set()); // Store liked songs
  const [showMenu, setShowMenu] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [playlists, setPlaylists] = useState([]); // Store user playlists
  const [selectedSong, setSelectedSong] = useState(null);
  

  const { backendUrl, userData, isLoggedin, addToQueue  } = useContext(AppContext);
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

  // Function to handle song play
  const handlePlaySong = (song) => {
    setCurrentTrack(song);
    addToQueue(song);
  };

    fetchPlaylist();
  }, [id, backendUrl]);

  // Fetch user's liked songs
  useEffect(() => {
    if (isLoggedin && userId) {
      const fetchLikedSongs = async () => {
        try {
          const response = await axios.get(`${backendUrl}/api/songs/liked-songs/${userId}`);
          setLikedSongs(new Set(response.data.likedSongs.map((song) => song._id)));
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
          const response = await axios.get(`${backendUrl}/api/playlists/my-playlists`, {
            withCredentials: true,
          });
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
  const handleLikeToggle = async (songId) => {
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

  // Remove song from playlist (Only for owner)
  const removeSongFromPlaylist = async (songId) => {
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
      <Header />
      <div className="playlist-songs-page">
        <h2>{playlist.name}</h2>
        <div className="songs-grid">
          {playlist.songs.map((song) => (
            <div key={song._id} className="song-card">
              <img
                src={`${backendUrl}${song.coverImage}`}
                alt={song.title}
                className="song-cover"
                onClick={() => setCurrentTrack(song)}
              />
              <div className="song-info">
                <p className="song-title">{song.title}</p>
                <Link to={`/profile/${song.artistId}`}><p className="song-artist">{song.artist}</p></Link>

                <div className="song-options-container">
                  <div className="song-options">
                    {isLoggedin && (
                      <>
                        <div className="like-icons">
                          <img
                            src={likedSongs.has(song._id) ? assets.liked_icon : assets.notliked_icon}
                            alt="Like"
                            className="like-icon"
                            onClick={() => handleLikeToggle(song._id)}
                          />
                        </div>

                        <img
                          src={assets.add_icon}
                          alt="Options"
                          className="options-icon"
                          onClick={() => setShowMenu(song._id)}
                        />
                      </>
                    )}
                  </div>

                  <img 
                    src={assets.add_queue_icon}
                    alt="Add To Queue"
                    className="add_queue_icon"
                    onClick={() =>addToQueue(song)}
                  />

                  {userData?.userId === playlist.owner && (
                    <img 
                      src={assets.delete_icon}
                      alt="Delete"
                      className="delete-icon"
                      onClick={() => removeSongFromPlaylist(song._id)}
                    />
                  )}
                </div>
              </div>

              {showMenu === song._id && (
                <div className="dropdown-menu">
                  <button
                    onClick={() => {
                      setSelectedSong(song);
                      setShowModal(true);
                      setShowMenu(null);
                    }}
                  >
                    Add to Playlist
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

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
  );
};

export default PlaylistSongsPage;
