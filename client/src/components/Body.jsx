import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "../css/Body.css";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext"; // Import the context to get isLoggedin

const Body = ({ setCurrentTrack, filteredSongs }) => {
  const [songs, setSongs] = useState([]);
  const { isLoggedin } = useContext(AppContext); // Get the isLoggedin state from context

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/songs");
        setSongs(response.data.songs);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    fetchSongs();
  }, []);

  // Filter songs based on search query or show all if no search query
  const songsToDisplay = filteredSongs && filteredSongs.length > 0
    ? songs.filter((song) => 
        song.title.toLowerCase().includes(filteredSongs.toLowerCase()) || 
        song.artist.toLowerCase().includes(filteredSongs.toLowerCase())
      )
    : songs;

  return (
    <div className="home-body">
      <h2 className="section-title">Published Songs</h2>

       {/* Conditionally render the upload button only if the user is logged in */}
       {isLoggedin && (
        <div>
          <Link to="/upload-music">
          <button className="upload-btn">Upload Music</button>
          </Link>
        </div>
      )}

      <div className="songs-grid">
        {songsToDisplay.map((song) => (
          <div
            key={song._id}
            className="song-card"
            onClick={() => setCurrentTrack(song)} // Update currentTrack when a card is clicked
          >
            <img
              src={`http://localhost:4000${song.coverImage}`}
              alt={song.title}
              className="song-cover"
            />
             <div className="song-info">
              <p className="song-title">{song.title}</p>
              <p className="song-artist"> {song.artist}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Body;
