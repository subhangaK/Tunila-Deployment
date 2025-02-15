import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "../css/Body.css";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";

const Body = ({ setCurrentTrack, filteredSongs }) => {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [likedSongs, setLikedSongs] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const { backendUrl, isLoggedin, userData, recommendedSongs, fetchRecommendedSongs, addToQueue } = useContext(AppContext);
  const userId = userData?.userId;

  // Fetch songs
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/songs`);
        setSongs(response.data.songs);
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

  // Fetch recommended songs **only when userData is available**
  useEffect(() => {
    if (isLoggedin && userId) {
      fetchRecommendedSongs(userId);
    }
  }, [userId, fetchRecommendedSongs]);

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

  // Fetch playlists for the logged-in user
  useEffect(() => {
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

    if (isLoggedin) fetchPlaylists();
  }, [backendUrl, isLoggedin]);

  // Fetch public playlists excluding those created by the logged-in user
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
        toast.error("Failed to load public playlists.", {
          position: "top-right",
          autoClose: 3000,
        });
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

  // Filter songs based on search query
  const songsToDisplay =
    filteredSongs && filteredSongs.length > 0
      ? songs.filter((song) =>
          song.title.toLowerCase().includes(filteredSongs.toLowerCase()) ||
          song.artist.toLowerCase().includes(filteredSongs.toLowerCase())
        )
      : songs;

  return (
    <div className="home-body">
      <div className="action-buttons-container">
        {isLoggedin && (
          <>
            <Link to="/upload-music">
              <button className="upload-btn">Upload Music</button>
            </Link>
            <Link to="/playlists">
              <button className="playlist-btn">My Playlists</button>
            </Link>
            <Link to="/liked-songs">
              <button className="likedsong-btn">
                <img className="likedsong-btn-icon" src={assets.liked_icon} alt="" />
              </button>
            </Link>
          </>
        )}
      </div>

      {/* Recommended Songs Section */}
      {recommendedSongs.length > 0 && (
        <>
          <h2 className="section-title">Recommended Songs</h2>
          <div className="songs-grid">
            {recommendedSongs.map((song) => (
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
                          alt="Add to Playlist"
                          className="options-icon"
                          onClick={() => {
                            setSelectedSong(song);
                            setShowModal(true);
                          }}
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
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="section-title">Published Songs</h2>
      <div className="songs-grid">
        {songsToDisplay.map((song) => (
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
                      alt="Add to Playlist"
                      className="options-icon"
                      onClick={() => {
                        setSelectedSong(song);
                        setShowModal(true);
                      }}
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
            </div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Public Playlists</h2>
      <div className="playlists-grid">
        {publicPlaylists.map((playlist) => (
          <div
            key={playlist._id}
            className="playlist-card"
            onClick={() => (window.location.href = `/playlists/${playlist._id}`)}
          >
            <img
              src={`${backendUrl}${playlist.coverImage}`}
              alt={playlist.name}
              className="playlist-cover-body"
            />
            <div className="playlist-info">
              <h3>{playlist.name}</h3>
            </div>
          </div>
        ))}
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

export default Body;