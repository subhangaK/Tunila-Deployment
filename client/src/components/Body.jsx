import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "../css/Body.css";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets"; // Import the assets
import { toast } from "react-toastify"; // Import toast

const Body = ({ setCurrentTrack, filteredSongs }) => {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]); // State for public playlists
  const [selectedSong, setSelectedSong] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const { backendUrl, isLoggedin, userData } = useContext(AppContext);
  const navigate = useNavigate();

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
        toast.error("Failed to load playlists.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    if (isLoggedin) fetchPlaylists();
  }, [backendUrl, isLoggedin]);

  // Fetch all public playlists (exclude those created by the logged-in user)
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
          </>
        )}
      </div>

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
              <p className="song-artist">{song.artist}</p>
              <div className="song-options">
                {isLoggedin && (
                  <img
                    src={assets.tripledot_icon} // Use the imported icon here
                    alt="Options"
                    className="options-icon"
                    onClick={() => setShowMenu(song._id)}
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

      <h2 className="section-title">Public Playlists</h2>
      <div className="playlists-grid">
        {publicPlaylists.map((playlist) => (
          <div
            key={playlist._id}
            className="playlist-card"
            onClick={() => navigate(`/playlists/${playlist._id}`)}
          >
            <img
              src={`${backendUrl}${playlist.coverImage}`}
              alt={playlist.name}
              className="playlist-cover"
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
          <ul>
            {playlists.map((playlist) => (
              <li key={playlist._id}>
                <button onClick={() => addToPlaylist(playlist._id)}>
                  {playlist.name}
                </button>
              </li>
            ))}
          </ul>
          <h4>Create New Playlist</h4>
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Enter playlist name"
          />
          <button onClick={createPlaylist}>Create and Add</button>
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Body;
