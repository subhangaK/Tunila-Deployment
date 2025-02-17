import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import "../css/SearchResults.css";
import Header from "./Header";

const SearchResultsPage = ({ setCurrentTrack }) => {
  const { backendUrl, userData, isLoggedin, addToQueue } = useContext(AppContext);
  const [results, setResults] = useState({ songs: [], artists: [] });
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
        const response = await axios.get(`${backendUrl}/api/search?q=${searchQuery}`);
        const searchResults = response.data.results || {};
        
        // Find top result
        let top = null;
        if (searchResults.artists?.length > 0) {
          top = { type: 'artist', data: searchResults.artists[0] };
        } else if (searchResults.songs?.length > 0) {
          top = { type: 'song', data: searchResults.songs[0] };
        }
        setTopResult(top);

        // Deduplicate songs
        const seenSongIds = new Set();
        let uniqueSongs = [];
        let relatedSongsList = [];

        // Add top result song to seen songs if it exists
        if (top?.type === 'song') {
          seenSongIds.add(top.data._id);
          uniqueSongs.push(top.data);
          
          // Get related songs for the top result
          if (top.data.related) {
            relatedSongsList = top.data.related
              .filter(song => !seenSongIds.has(song._id))
              .slice(0, 5);
            relatedSongsList.forEach(song => seenSongIds.add(song._id));
          }
        } else if (top?.type === 'artist') {
          // Get songs by the artist
          relatedSongsList = searchResults.songs
            .filter(song => song.artistId === top.data._id)
            .slice(0, 5);
          relatedSongsList.forEach(song => seenSongIds.add(song._id));
        }

        // Filter out duplicates from main search results
        if (searchResults.songs) {
          searchResults.songs.forEach(song => {
            if (!seenSongIds.has(song._id)) {
              seenSongIds.add(song._id);
              uniqueSongs.push(song);
            }
          });
        }

        setRelatedSongs(relatedSongsList);
        setResults({
          ...searchResults,
          songs: uniqueSongs.filter(song => song._id !== top?.data._id) // Remove top result from main list
        });
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery) fetchResults();
  }, [searchQuery, backendUrl]);

  if (loading) return <div className="search-loading">Searching...</div>;

  return (
    <>
    <Header></Header>
    <div className="search-results-page">
      <h1 className="search-title">Results for "{searchQuery}"</h1>

      {/* Top Result and Related Songs Section */}
      {topResult && (
        <div className="search-top-section">
          <div className="search-top-container">
            <h2 className="search-section-title">Top Result</h2>
            {topResult.type === 'artist' ? (
              <div className="search-top-artist" onClick={() => navigate(`/profile/${topResult.data._id}`)}>
                <div className="search-artist-image-container">
                  <img
                    src={`${backendUrl}${topResult.data.profilePicture}`}
                    alt={topResult.data.name}
                    className="search-artist-image"
                  />
                </div>
                <p className="search-artist-name">{topResult.data.name}</p>
                <p className="search-result-type">Artist</p>
              </div>
            ) : (
              <div className="search-top-song" onClick={() => setCurrentTrack(topResult.data)}>
                <img
                  src={`${backendUrl}${topResult.data.coverImage}`}
                  alt={topResult.data.title}
                  className="search-song-cover"
                />
                <div className="search-song-info">
                  <p className="search-song-title">{topResult.data.title}</p>
                  <p className="search-song-artist" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${topResult.data.artistId}`);
                  }}>
                    {topResult.data.artist?.name}
                  </p>
                  <p className="search-result-type">Song</p>
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
                        <img
                          src={`${backendUrl}${song.coverImage}`}
                          alt={song.title}
                          className="search-related-image"
                        />
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
        <>
          <h2 className="search-section-title">Songs</h2>
          <div className="search-songs-grid">
            {results.songs.map((song) => (
              <div key={song._id} className="search-song-card" onClick={() => setCurrentTrack(song)}>
                <img
                  src={`${backendUrl}${song.coverImage}`}
                  alt={song.title}
                  className="search-song-cover"
                />
                <div className="search-song-info">
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
        </>
      )}

      {/* Artists Section */}
      {results?.artists?.length > 0 && (
        <>
          <h2 className="search-section-title">Artists</h2>
          <div className="search-artists-grid">
            {results.artists.map((artist) => (
              <div key={artist._id} className="search-artist">
                <div className="search-artist-image-container">
                  <img
                    src={`${backendUrl}${artist.profilePicture}`}
                    alt={artist.name}
                    className="search-artist-image"
                    onClick={() => navigate(`/profile/${artist._id}`)}
                  />
                </div>
                <div className="search-artist-info">
                  <p className="search-artist-name">{artist.name}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}


  {/* Users Section */}
  {results.users.length > 0 && (
        <>
          <h2 className="search-section-title">Users</h2>
          <div className="search-artists-grid">
            {results.users.map(user => (
              <div key={user._id} className="search-artist" onClick={() => navigate(`/profile/${user._id}`)}>
                <div className="search-artist-image-container">
                  <img src={`${backendUrl}${user.profilePicture}`} alt={user.name} className="search-artist-image"/>
                </div>
                <p className="search-artist-name">{user.name}</p>
              </div>
            ))}
          </div>
        </>
      )}

    {/* Playlists Section */}
    {results.playlists.length > 0 && (
        <section className="search-playlist-section">
          <h2>Playlists</h2>
          <div className="search-playlists-grid">
            {results.playlists.map(playlist => (
              <div key={playlist._id} className="search-playlist" 
                onClick={() => navigate(`/playlists/${playlist._id}`)}>
                <img src={`${backendUrl}${playlist.coverImage}`} alt={playlist.name} />
                <h3>{playlist.name}</h3>
                <p>{playlist.songs.length} songs</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!results && <p className="search-no-results">No results found.</p>}
    </div>
    </>
  );
};

export default SearchResultsPage;