import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import "../css/BrowsePlaylistsPage.css";
import { assets } from "../assets/assets";

const BrowsePlaylistsPage = () => {
  const { backendUrl, isLoggedin, userData } = useContext(AppContext);
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Fetch all public playlists
  useEffect(() => {
    const fetchPublicPlaylists = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${backendUrl}/api/playlists/public`);
        // Filter out the current user's playlists if logged in
        const filteredPlaylists = userData
          ? response.data.playlists.filter(
              (playlist) => playlist.owner !== userData.userId
            )
          : response.data.playlists;
        setPlaylists(filteredPlaylists);
      } catch (error) {
        console.error("Error fetching public playlists:", error);
        toast.error("Failed to load public playlists", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicPlaylists();
  }, [backendUrl, userData]);

  // Filter playlists based on search query
  const filteredPlaylists = playlists.filter(
    (playlist) =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (playlist.ownerName &&
        playlist.ownerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="browse-playlists-container">
      <div className="browse-playlists-header">
        <h1>Browse Public Playlists</h1>
        <p>Discover playlists created by the Tunila community</p>

        <div className="browse-playlists-search">
          <input
            type="text"
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="browse-playlists-search-input"
          />
          <span className="browse-playlists-search-icon"></span>
        </div>
      </div>

      {isLoading ? (
        <div className="browse-playlists-loading">
          <div className="browse-playlists-spinner"></div>
          <p>Loading playlists...</p>
        </div>
      ) : (
        <>
          {filteredPlaylists.length === 0 ? (
            <div className="browse-playlists-empty">
              <img
                src={assets.search_icon || "/default-playlist-icon.png"}
                alt="No playlists"
                className="browse-playlists-empty-icon"
              />
              <h3>No public playlists found</h3>
              <p>
                {searchQuery
                  ? "No playlists match your search. Try a different term."
                  : "There are currently no public playlists available."}
              </p>
              {isLoggedin && (
                <button
                  className="browse-playlists-create-btn"
                  onClick={() => navigate("/playlists")}
                >
                  Create Your Own Playlist
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="browse-playlists-stats">
                <span>
                  {filteredPlaylists.length}{" "}
                  {filteredPlaylists.length === 1 ? "playlist" : "playlists"}{" "}
                  found
                </span>
              </div>

              <div className="browse-playlists-grid">
                {filteredPlaylists.map((playlist) => (
                  <div
                    key={playlist._id}
                    className="browse-playlists-card"
                    onClick={() => navigate(`/playlists/${playlist._id}`)}
                  >
                    <div className="browse-playlists-cover-container">
                      <img
                        src={`${backendUrl}${playlist.coverImage}`}
                        alt={playlist.name}
                        className="browse-playlists-cover"
                        onError={(e) => {
                          e.target.src =
                            assets.default_playlist || "/default-playlist.jpg";
                        }}
                      />
                      <div className="browse-playlists-play-overlay">
                        <span>▶</span>
                      </div>
                      <div className="browse-playlists-song-count">
                        {playlist.songs?.length || 0} songs
                      </div>
                    </div>

                    <div className="browse-playlists-info">
                      <h3 className="browse-playlists-title">
                        {playlist.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BrowsePlaylistsPage;
