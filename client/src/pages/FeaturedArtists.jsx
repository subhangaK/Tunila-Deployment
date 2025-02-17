import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import "../css/FeaturedArtists.css"; // Updated CSS file
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";
import Header from "../components/Header";

const FeaturedArtists = () => {
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const { backendUrl } = useContext(AppContext);

  // ✅ Fetch all artists with at least one published song & shuffle them
  useEffect(() => {
    const fetchFeaturedArtists = async () => {
      try {
        const songsResponse = await axios.get(`${backendUrl}/api/songs`);
        const allSongs = songsResponse.data.songs;

        // Get unique artist IDs from songs
        const uniqueArtistIds = [...new Set(allSongs.map(song => song.artistId))];

        // Fetch user data for each artist
        const artistsData = await Promise.all(
          uniqueArtistIds.map(async (artistId) => {
            try {
              const userResponse = await axios.get(`${backendUrl}/api/user/profile/${artistId}`);
              return {
                artistId,
                name: userResponse.data.userProfile.name,
                profilePicture: userResponse.data.userProfile.profilePicture || assets.default_profile
              };
            } catch (error) {
              console.error("Error fetching artist data:", error);
              return null;
            }
          })
        );

        // Filter out null values, shuffle, and set the list
        const validArtists = artistsData.filter(artist => artist !== null);
        const shuffledArtists = validArtists.sort(() => Math.random() - 0.5);
        setFeaturedArtists(shuffledArtists);
      } catch (error) {
        console.error("Error fetching featured artists:", error);
        toast.error("Failed to load featured artists.");
      }
    };

    fetchFeaturedArtists();
  }, [backendUrl]);

  return (
    <>
    <Header />
    <div className="tunila-featured-artists-page">
      {/* Featured Artists Section */}
      <h2 className="tunila-featured-artists-title">Featured Artists</h2>
      <div className="tunila-featured-artists-list">
        {featuredArtists.length > 0 ? (
          featuredArtists.map((artist, index) => (
            <Link key={artist.artistId} to={`/profile/${artist.artistId}`} className="tunila-featured-artist-card">
              <span className="tunila-artist-number">{index + 1}.</span> {/* ✅ Numbering */}
              <div className="tunila-featured-artist-image-container">
                <img 
                  src={`${backendUrl}${artist.profilePicture}`} 
                  alt={artist.name} 
                  className="tunila-featured-artist-image" 
                />
              </div>
              <div className="tunila-featured-artist-info">
                <p className="tunila-featured-artist-name">{artist.name}</p>
                <div className="tunila-featured-artist-verified">
                  <img src={assets.verified_icon_black} alt="Verified Badge" className="tunila-verified-badge" />
                  <span>Verified Tunila Artist</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>No featured artists available.</p>
        )}
      </div>
    </div>
    </>
  );
};

export default FeaturedArtists;
