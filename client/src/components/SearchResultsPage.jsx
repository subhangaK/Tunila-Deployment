import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import "../css/SearchResults.css";
import Header from "./Header";
import { assets } from "../assets/assets";

const SearchResultsPage = ({ setCurrentTrack }) => {
  const { backendUrl, userData, isLoggedin, addToQueue } =
    useContext(AppContext);
  const [results, setResults] = useState({
    songs: [],
    merchandise: [],
    artists: [],
    users: [],
    playlists: [],
  });
  const [loading, setLoading] = useState(true);
  const [topResult, setTopResult] = useState(null);
  const [relatedSongs, setRelatedSongs] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const searchQuery = new URLSearchParams(location.search).get("q");
  const userId = userData?.userId;

  // Function to handle song play
  const handlePlaySong = (song) => {
    setCurrentTrack(song);
    addToQueue(song);
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/search?q=${searchQuery}`
        );
        const searchResults = response.data.results || {};

        // Find top result
        let top = null;
        if (searchResults.artists?.length > 0) {
          top = { type: "artist", data: searchResults.artists[0] };
        } else if (searchResults.songs?.length > 0) {
          top = { type: "song", data: searchResults.songs[0] };
        }
        setTopResult(top);

        // Deduplicate songs
        const seenSongIds = new Set();
        let uniqueSongs = [];
        let relatedSongsList = [];

        // Add top result song to seen songs if it exists
        if (top?.type === "song") {
          seenSongIds.add(top.data._id);
          uniqueSongs.push(top.data);

          // Get related songs for the top result
          if (top.data.related) {
            relatedSongsList = top.data.related
              .filter((song) => !seenSongIds.has(song._id))
              .slice(0, 5);
            relatedSongsList.forEach((song) => seenSongIds.add(song._id));
          }
        } else if (top?.type === "artist") {
          // Get songs by the artist
          relatedSongsList = searchResults.songs
            .filter((song) => song.artistId === top.data._id)
            .slice(0, 5);
          relatedSongsList.forEach((song) => seenSongIds.add(song._id));
        }

        // Filter out duplicates from main search results
        if (searchResults.songs) {
          searchResults.songs.forEach((song) => {
            if (!seenSongIds.has(song._id)) {
              seenSongIds.add(song._id);
              uniqueSongs.push(song);
            }
          });
        }

        setRelatedSongs(relatedSongsList);
        setResults({
          ...searchResults,
          songs: uniqueSongs.filter((song) => song._id !== top?.data._id), // Remove top result from main list
        });
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) fetchResults();
  }, [searchQuery, backendUrl]);

  if (loading)
    return (
      <div className="search-loading-container">
        <div className="search-loading">
          <div className="search-loading-spinner"></div>
          <p>Searching for "{searchQuery}"...</p>
        </div>
      </div>
    );

  return (
    <>
      <div className="search-results-page">
        <div className="search-header">
          <h1 className="search-title">
            Results for "<span>{searchQuery}</span>"
          </h1>
        </div>
        {/* Top Result and Related Songs Section */}
        {topResult && (
          <div className="search-top-section">
            <div className="search-top-container">
              <h2 className="search-section-title">Top Result</h2>
              {topResult.type === "artist" ? (
                <div
                  className="search-top-artist"
                  onClick={() => navigate(`/profile/${topResult.data._id}`)}
                >
                  <div className="search-artist-image-container">
                    <img
                      src={`${backendUrl}${topResult.data.profilePicture}`}
                      alt={topResult.data.name}
                      className="search-artist-image"
                    />
                  </div>
                  <p className="search-artist-name">{topResult.data.name}</p>
                  <span className="search-result-type">Artist</span>
                  <button className="search-view-profile-btn">
                    View Profile
                  </button>
                </div>
              ) : (
                <div
                  className="search-top-song"
                  onClick={() => setCurrentTrack(topResult.data)}
                >
                  <div className="search-top-song-artwork">
                    <img
                      src={`${backendUrl}${topResult.data.coverImage}`}
                      alt={topResult.data.title}
                      className="search-song-cover"
                    />
                    <div className="search-play-overlay">
                      <i className="fas fa-play"></i>
                    </div>
                  </div>
                  <div className="search-song-info">
                    <p className="search-song-title">{topResult.data.title}</p>
                    <p
                      className="search-song-artist"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${topResult.data.artistId}`);
                      }}
                    >
                      {topResult.data.artist?.name}
                    </p>
                    <span className="search-result-type">Song</span>
                  </div>
                  <div className="search-song-actions">
                    <button className="search-action-btn search-play-btn">
                      <i className="fas fa-play">
                        <img
                          className="search-play-icon-top-song"
                          src={assets.play_icon}
                          alt=""
                        />
                      </i>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Related Songs Table */}
            {relatedSongs.length > 0 && (
              <div className="search-related-container">
                <h2 className="search-section-title">Related Songs</h2>
                <table className="search-related-table">
                  <tbody>
                    {relatedSongs.map((song, index) => (
                      <tr
                        key={song._id}
                        className="search-related-row"
                        onClick={() => setCurrentTrack(song)}
                      >
                        <td className="search-related-index">{index + 1}</td>
                        <td className="search-related-cover">
                          <div className="search-related-image-container">
                            <img
                              src={`${backendUrl}${song.coverImage}`}
                              alt={song.title}
                              className="search-related-image"
                            />
                            <div className="search-related-play-overlay">
                              <i className="fas fa-play"></i>
                            </div>
                          </div>
                        </td>
                        <td className="search-related-info">
                          <p className="search-related-title">{song.title}</p>
                          <p
                            className="search-related-artist"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/profile/${song.artistId}`);
                            }}
                          >
                            {song.artist?.name}
                          </p>
                        </td>
                        <td className="search-related-actions">
                          <button className="search-related-action-btn">
                            <i className="fas fa-ellipsis-h"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* Main Songs Section */}
        {results?.songs?.length > 0 && (
          <div className="search-songs-section">
            <h2 className="search-section-title">Songs</h2>
            <div className="search-songs-grid">
              {results.songs.map((song) => (
                <div
                  key={song._id}
                  className="search-song-card"
                  onClick={() => setCurrentTrack(song)}
                >
                  <div className="search-song-artwork">
                    <img
                      src={`${backendUrl}${song.coverImage}`}
                      alt={song.title}
                      className="search-song-cover"
                    />
                    <div className="search-play-overlay">
                      <i className="fas fa-play"></i>
                    </div>
                  </div>
                  <div className="search-song-details">
                    <p className="search-song-title">{song.title}</p>
                    <p
                      className="search-song-artist"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${song.artistId}`);
                      }}
                    >
                      {song.artist?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Artists Section */}
        {results?.artists?.length > 0 && (
          <div className="search-artists-section">
            <h2 className="search-section-title">Artists</h2>
            <div className="search-artists-grid">
              {results.artists.map((artist) => (
                <div key={artist._id} className="search-artist-card">
                  <div
                    className="search-artist-image-container"
                    onClick={() => navigate(`/profile/${artist._id}`)}
                  >
                    <img
                      src={`${backendUrl}${artist.profilePicture}`}
                      alt={artist.name}
                      className="search-artist-image"
                    />
                  </div>
                  <div className="search-artist-info">
                    <p className="search-artist-name">{artist.name}</p>
                    <span className="search-artist-type">Artist</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Users Section */}
        {results?.users?.length > 0 && (
          <div className="search-users-section">
            <h2 className="search-section-title">Users</h2>
            <div className="search-users-grid">
              {results.users.map((user) => (
                <div
                  key={user._id}
                  className="search-user-card"
                  onClick={() => navigate(`/profile/${user._id}`)}
                >
                  <div className="search-user-image-container">
                    <img
                      src={`${backendUrl}${user.profilePicture}`}
                      alt={user.name}
                      className="search-user-image"
                    />
                  </div>
                  <div className="search-user-info">
                    <p className="search-user-name">{user.name}</p>
                    <span className="search-user-type">User</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Playlists Section */}
        {results?.playlists?.length > 0 && (
          <div className="search-playlists-section">
            <h2 className="search-section-title">Playlists</h2>
            <div className="search-playlists-grid">
              {results.playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  className="search-playlist-card"
                  onClick={() => navigate(`/playlists/${playlist._id}`)}
                >
                  <div className="search-playlist-artwork">
                    <img
                      src={`${backendUrl}${playlist.coverImage}`}
                      alt={playlist.name}
                      className="search-playlist-cover"
                    />
                    <div className="search-playlist-overlay">
                      <i className="fas fa-play"></i>
                    </div>
                  </div>
                  <div className="search-playlist-info">
                    <h3 className="search-playlist-name">{playlist.name}</h3>
                    <p className="search-playlist-count">
                      {playlist.songs.length} songs
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results?.merchandise?.length > 0 && (
          <div className="search-merchandise-section">
            <h2 className="search-section-title">Merchandise</h2>
            <div className="search-merchandise-grid">
              {results.merchandise.map((item) => (
                <div
                  key={item._id}
                  className="search-merchandise-card"
                  onClick={() => navigate(`/merch/${item._id}`)}
                >
                  <div className="search-merchandise-image">
                    <img
                      src={`${backendUrl}${item.images[0]}`}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = assets.placeholder_image;
                      }}
                    />
                  </div>
                  <div className="search-merchandise-info">
                    <h3>{item.name}</h3>
                    {item.artist && (
                      <p className="search-merchandise-artist">
                        By: {item.artist.name}
                      </p>
                    )}
                    <p className="search-merchandise-price">Rs {item.price}</p>
                    <span className="search-merchandise-type">{item.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* No Results Message */}
        {!topResult &&
          !results.songs?.length &&
          !results.artists?.length &&
          !results.users?.length &&
          !results.playlists?.length && (
            <div className="search-no-results">
              <i className="fas fa-search"></i>
              <p>No results found for "{searchQuery}".</p>
              <p>Try searching with different keywords.</p>
            </div>
          )}
      </div>
    </>
  );
};

export default SearchResultsPage;
