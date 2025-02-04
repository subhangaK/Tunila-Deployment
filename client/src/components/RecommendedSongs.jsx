import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import "../css/RecommendedSongs.css"; // Create CSS for styling

const RecommendedSongs = ({ setCurrentTrack }) => {
  const { recommendedSongs, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="recommended-section">
      <h2>Recommended for You</h2>
      <div className="recommended-grid">
        {recommendedSongs.length > 0 ? (
          recommendedSongs.map((song) => (
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
              </div>
            </div>
          ))
        ) : (
          <p>No recommendations available yet.</p>
        )}
      </div>
    </div>
  );
};

export default RecommendedSongs;
