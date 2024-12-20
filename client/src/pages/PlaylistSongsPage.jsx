import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/PlaylistSongsPage.css";
import Header from "../components/Header";

const PlaylistSongsPage = ({ setCurrentTrack }) => {
  const { id } = useParams(); // Get the playlist ID from the route parameters
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/playlists/${id}`);
        setPlaylist(response.data.playlist);
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };

    fetchPlaylist();
  }, [id]);

  if (!playlist) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header/>
    <div className="playlist-songs-page">
      <h2>{playlist.name}</h2>
      <div className="songs-grid">
        {playlist.songs.map((song) => (
          <div
            key={song._id}
            className="song-card"
            onClick={() => setCurrentTrack(song)} // Update the current track on click
          >
            <img
              src={`http://localhost:4000${song.coverImage}`}
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
    </div>
    </div>
  );
};

export default PlaylistSongsPage;
