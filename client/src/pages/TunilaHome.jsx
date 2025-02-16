import React, { useEffect, useState, useContext } from "react";
import "../css/TunilaHome.css";
import { assets } from "../assets/assets";
import Header from "../components/Header";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { Link } from "react-router-dom";

const TunilaHome = ({ setCurrentTrack }) => {
  const { backendUrl } = useContext(AppContext);
  const [popularSongs, setPopularSongs] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);

  // Fetch most popular songs
  useEffect(() => {
    const fetchPopularSongs = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/songs`);
        const sortedSongs = response.data.songs
          .sort((a, b) => b.likedBy.length - a.likedBy.length)
          .slice(0, 5);
        setPopularSongs(sortedSongs);
      } catch (error) {
        console.error("Error fetching popular songs:", error);
      }
    };

    fetchPopularSongs();
  }, [backendUrl]);

  // Fetch featured artists (random 5 artists with at least one song)
  useEffect(() => {
    const fetchFeaturedArtists = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/songs`);
        const allSongs = response.data.songs;

        const artistMap = new Map();
        allSongs.forEach((song) => {
          if (!artistMap.has(song.artistId)) {
            artistMap.set(song.artistId, {
              artistId: song.artistId,
              name: song.artist,
              profilePicture: song.artistProfilePicture || assets.default_profile, // Default profile picture if none
            });
          }
        });

        const artistArray = Array.from(artistMap.values());
        const shuffledArtists = artistArray.sort(() => 0.5 - Math.random()).slice(0, 5);
        setFeaturedArtists(shuffledArtists);
      } catch (error) {
        console.error("Error fetching featured artists:", error);
      }
    };

    fetchFeaturedArtists();
  }, [backendUrl]);

  return (
    <div className="tunila-home-page">
      <Header />

      {/* Hero Section */}
      <section className="tunila-home-hero">
        <video autoPlay muted loop className="tunila-home-hero-video">
          <source src={assets.hero_video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="tunila-home-hero-content">
          <h1>Tunila – Where Music Meets Creativity</h1>
          <p>Discover, stream, and publish music effortlessly while supporting local artists.</p>
          <div className="tunila-home-cta-container">
            <a href="/home" className="tunila-home-cta-btn">Start Listening</a>
            <a href="/upload-music" className="tunila-home-cta-btn secondary">Publish Your Music</a>
          </div>
        </div>
      </section>

      {/* Most Popular on Tunila */}
      <section className="tunila-home-popular">
        <h2>Most Popular on Tunila</h2>
        <div className="tunila-home-songs-grid">
          {popularSongs.length > 0 ? (
            popularSongs.map((song) => (
              <div key={song._id} className="tunila-home-song-card" onClick={() => setCurrentTrack(song)}>
                <img src={`${backendUrl}${song.coverImage}`} alt={song.title} className="tunila-home-song-cover" />
                <p className="tunila-home-song-title">{song.title}</p>
                <Link to={`/profile/${song.artistId}`}><p className="tunila-home-song-artist">{song.artist}</p></Link>
              </div>
            ))
          ) : (
            <p className="tunila-home-no-songs">No popular songs yet.</p>
          )}
        </div>
      </section>

      {/* Why Tunila? */}
      <section className="tunila-home-why">
        <h2>Why Tunila?</h2>
        <div className="tunila-home-features">
          <div className="tunila-home-feature">
            <img src={assets.upload_music_image} alt="Upload Music" />
            <h3>Upload Music</h3>
            <p>Artists can publish their music effortlessly and gain exposure.</p>
          </div>
          <div className="tunila-home-feature">
            <img src={assets.streaming_image} alt="Stream Music" />
            <h3>Stream Seamlessly</h3>
            <p>Listen to high-quality music with no interruptions.</p>
          </div>
          <div className="tunila-home-feature">
            <img src={assets.playlist_image} alt="Create Playlists" />
            <h3>Personalized Playlists</h3>
            <p>Curate your own playlists and explore new sounds.</p>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="tunila-home-featured">
        <h2>Featured Artists</h2>
        <div className="tunila-home-artists-grid">
          {featuredArtists.length > 0 ? (
            featuredArtists.map((artist) => (
              <Link key={artist.artistId} to={`/profile/${artist.artistId}`} className="tunila-home-artist">
                <img src={`${backendUrl}${artist.profilePicture}`} alt={artist.name} className="tunila-home-artist-image" />
                <p>{artist.name}</p>
              </Link>
            ))
          ) : (
            <p>No featured artists available.</p>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="tunila-home-how-it-works">
        <h2>How It Works</h2>
        <div className="tunila-home-steps">
          <div className="tunila-home-step">
            <span>1</span>
            <h3>Sign Up</h3>
            <p>Create an account and start exploring music.</p>
          </div>
          <div className="tunila-home-step">
            <span>2</span>
            <h3>Stream & Discover</h3>
            <p>Listen to trending music and support local artists.</p>
          </div>
          <div className="tunila-home-step">
            <span>3</span>
            <h3>Publish & Promote</h3>
            <p>Upload your tracks and get featured on Tunila.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="tunila-home-testimonials">
        <h2>What People Say</h2>
        <div className="tunila-home-reviews">
          <div className="tunila-home-review">
            <p>"Tunila helped me find incredible new artists. Love the recommendations!"</p>
            <span>- User A</span>
          </div>
          <div className="tunila-home-review">
            <p>"As an indie artist, Tunila gave me a platform to showcase my work."</p>
            <span>- User B</span>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="tunila-home-final-cta">
        <h2>Join Tunila Today</h2>
        <p>Start streaming or share your own music with the world.</p>
        <a href="/signup" className="tunila-home-cta-btn">Get Started</a>
      </section>
    </div>
  );
};

export default TunilaHome;
