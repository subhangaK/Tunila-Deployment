import React, { useEffect, useState, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Header from "../components/Header";
import MerchItem from "../components/MerchItem";
import { assets } from "../assets/assets";
import "../css/TunilaHome.css";
import axios from "axios";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

const TunilaHome = ({ setCurrentTrack }) => {
  const { backendUrl } = useContext(AppContext);
  const [popularSongs, setPopularSongs] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [trendingMerch, setTrendingMerch] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const featuredRef = useRef(null);
  const artistsRef = useRef(null);
  const shopRef = useRef(null);
  const featuresRef = useRef(null);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);

      // Check if elements are in viewport for animations
      const elements = [featuredRef, artistsRef, shopRef, featuresRef];
      elements.forEach((ref) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const isVisible =
            rect.top < window.innerHeight * 0.8 && rect.bottom >= 0;
          if (isVisible) {
            ref.current.classList.add("tunila-home-in-view");
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Fetch featured artists
  useEffect(() => {
    const fetchFeaturedArtists = async () => {
      try {
        const songsResponse = await axios.get(`${backendUrl}/api/songs`);
        const allSongs = songsResponse.data.songs;

        // Get unique artist IDs from songs
        const artistIds = [...new Set(allSongs.map((song) => song.artistId))];

        // Fetch user data for each artist
        const artistsData = await Promise.all(
          artistIds.map(async (artistId) => {
            try {
              const userResponse = await axios.get(
                `${backendUrl}/api/user/profile/${artistId}`
              );
              return {
                artistId,
                name: userResponse.data.userProfile.name,
                profilePicture:
                  userResponse.data.userProfile.profilePicture ||
                  assets.default_profile,
              };
            } catch (error) {
              console.error("Error fetching artist data:", error);
              return null;
            }
          })
        );

        // Filter out null values and get random 5 artists
        const validArtists = artistsData.filter((artist) => artist !== null);
        const shuffledArtists = validArtists
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);

        setFeaturedArtists(shuffledArtists);
      } catch (error) {
        console.error("Error fetching featured artists:", error);
      }
    };

    fetchFeaturedArtists();
  }, [backendUrl]);

  // Fetch trending merchandise
  useEffect(() => {
    const fetchTrendingMerch = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/merch`);
        // Sort by wishlist count and get top 4
        const sortedMerch = response.data
          .sort(
            (a, b) =>
              (b.wishlistedBy?.length || 0) - (a.wishlistedBy?.length || 0)
          )
          .slice(0, 4);
        setTrendingMerch(sortedMerch);
      } catch (error) {
        console.error("Error fetching trending merchandise:", error);
      }
    };

    fetchTrendingMerch();
  }, [backendUrl]);

  return (
    <div className="tunila-home-page">
      <Header className={isScrolled ? "tunila-home-header-scrolled" : ""} />

      {/* Hero Section with Video Background and Animated Content */}
      <section className="tunila-home-hero">
        <div className="tunila-home-hero-content-wrapper">
          <video autoPlay muted loop className="tunila-home-hero-video">
            <source src={assets.hero_video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="tunila-home-hero-overlay"></div>
          <div className="tunila-home-hero-content">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Discover Your Tune
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Stream, create, and connect with artists around the world
            </motion.p>
            <motion.div
              className="tunila-home-hero-cta-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                to="/home"
                className="tunila-home-cta-button tunila-home-primary"
              >
                <span>Start Listening</span>
                <span className="tunila-home-button-icon"></span>
              </Link>
              <Link
                to="/upload-music"
                className="tunila-home-cta-button tunila-home-secondary"
              >
                <span>Share Your Music</span>
                <span className="tunila-home-button-icon"></span>
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="tunila-home-hero-wave">
          <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Featured Playlist Section with Hover Effects */}
      <section
        ref={featuredRef}
        className="tunila-home-featured-section tunila-home-animate-fadein"
      >
        <div className="tunila-home-section-header">
          <h2>Hot Tunes Today</h2>
          <Link to="/browse" className="tunila-home-view-all-link">
            View All <span className="tunila-home-arrow">→</span>
          </Link>
        </div>
        <p className="tunila-home-shop-subtitle">
          Most liked Tunes from your favorite artists
        </p>
        <div className="tunila-home-songs-container">
          {popularSongs.length > 0 ? (
            popularSongs.map((song, index) => (
              <motion.div
                key={song._id}
                className="tunila-home-song-card"
                onClick={() => setCurrentTrack(song)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  y: -10,
                  boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
                  transition: { duration: 0.3 },
                }}
              >
                <div className="tunila-home-song-image-container">
                  <img
                    src={`${backendUrl}${song.coverImage}`}
                    alt={song.title}
                    className="tunila-home-song-cover"
                    loading="lazy"
                  />
                  <div className="tunila-home-play-overlay">
                    <div className="tunila-home-play-icon-wrapper">
                      <img
                        src={assets.play_icon}
                        alt="Play"
                        className="tunila-home-play-icon"
                      />
                    </div>
                  </div>
                </div>
                <div className="tunila-home-song-details">
                  <h3 className="tunila-home-song-title">{song.title}</h3>
                  <Link
                    to={`/profile/${song.artistId}`}
                    className="tunila-home-song-artist"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {song.artist}
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.p
              className="tunila-home-no-content-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              New music coming soon!
            </motion.p>
          )}
        </div>
      </section>

      {/* Artist Showcase */}
      <section className="about-artist-section">
        <div className="about-artist-content">
          <motion.div
            className="about-artist-text"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="about-section-title">Spotlight on Talent</h2>
            <p className="about-section-description">
              We're breaking down barriers in the music industry. Whether you're
              a folk singer from Pokhara or a rapper from Kathmandu, Tunila
              provides equal opportunities to shine. Our algorithm actively
              promotes new voices while respecting Nepal's rich musical
              heritage.
            </p>
            <Link to="/login" className="about-cta-btn">
              Start Your Journey
            </Link>
          </motion.div>
          <motion.div
            className="about-artist-image"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={assets.about_artist_showcase}
              alt="Nepali Artists"
              loading="lazy"
            />
          </motion.div>
        </div>
      </section>

      {/* Featured Artists Section with Animated Spotlights */}
      <section
        ref={artistsRef}
        className="tunila-home-artists-section tunila-home-animate-fadein"
      >
        <div className="tunila-home-artists-background">
          <div className="tunila-home-spotlight tunila-home-spotlight-1"></div>
          <div className="tunila-home-spotlight tunila-home-spotlight-2"></div>
        </div>
        <div className="tunila-home-section-content">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Featured Artists
          </motion.h2>
          <div className="tunila-home-artists-grid">
            {featuredArtists.length > 0 ? (
              featuredArtists.map((artist, index) => (
                <motion.div
                  key={artist.artistId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Link
                    to={`/profile/${artist.artistId}`}
                    className="tunila-home-artist-card"
                  >
                    <div className="tunila-home-artist-image-wrapper">
                      <img
                        src={`${backendUrl}${artist.profilePicture}`}
                        alt={artist.name}
                        className="tunila-home-artist-image"
                        loading="lazy"
                      />
                      <div className="tunila-home-artist-overlay">
                        <span className="tunila-home-artist-view">
                          View Profile
                        </span>
                      </div>
                    </div>
                    <h3 className="tunila-home-artist-name">{artist.name}</h3>
                  </Link>
                </motion.div>
              ))
            ) : (
              <p className="tunila-home-no-content-message">
                Artists coming soon!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Shop on Tunila Section with Card Animations */}
      <section
        ref={shopRef}
        className="tunila-home-shop-section tunila-home-animate-fadein"
      >
        <div className="tunila-home-section-header">
          <h2>Shop on Tunila</h2>
          <Link to="/merch" className="tunila-home-view-all-link">
            View All Merch <span className="tunila-home-arrow">→</span>
          </Link>
        </div>
        <p className="tunila-home-shop-subtitle">
          Most wishlisted items from your favorite artists
        </p>

        <div className="tunila-home-merch-showcase">
          {trendingMerch.length > 0 ? (
            trendingMerch.map((item, index) => (
              <motion.div
                key={item._id}
                className="tunila-home-merch-showcase-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  y: -10,
                  boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
                  transition: { duration: 0.3 },
                }}
              >
                <MerchItem item={item} />
                <div className="tunila-home-merch-badge">Trending</div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="tunila-home-shop-promo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="tunila-home-shop-promo-content">
                <h3>Exclusive Artist Merchandise</h3>
                <p>Support your favorite artists with official merchandise</p>
                <Link
                  to="/merch"
                  className="tunila-home-cta-button tunila-home-shop-now"
                >
                  Shop Now
                </Link>
              </div>
              <div className="tunila-home-shop-promo-image">
                <img
                  src={assets.merch_promo || "/merch-promo.jpg"}
                  alt="Tunila Merchandise"
                  loading="lazy"
                />
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission-section">
        <motion.div
          className="about-mission-content"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          <div className="about-mission-text">
            <h2 className="about-section-title">Our Mission</h2>
            <p className="about-section-description">
              Tunila was born from a passion to revolutionize Nepal's music
              industry. We're creating a vibrant ecosystem where aspiring
              artists can flourish and music lovers can discover authentic
              Nepali sounds.
            </p>
          </div>
          <div className="about-mission-image-full">
            <img
              src={assets.about_mission}
              alt="Music Collaboration"
              loading="lazy"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section with Animated Icons */}
      <section
        ref={featuresRef}
        className="tunila-home-features-section tunila-home-animate-fadein"
      >
        <h2>Why Music Lovers Choose Tunila</h2>
        <div className="tunila-home-features-grid">
          {[
            {
              icon: assets.upload_music_image || "/icons/upload-icon.svg",
              title: "Upload Your Sound",
              description:
                "Share your music with the world and connect with fans directly",
            },
            {
              icon: assets.streaming_image || "/icons/stream-icon.svg",
              title: "High-Quality Streaming",
              description:
                "Enjoy crystal clear sound with our premium audio technology",
            },
            {
              icon: assets.playlist_image || "/icons/playlist-icon.svg",
              title: "Personalized Playlists",
              description: "Discover new music tailored to your unique taste",
            },
            {
              icon: assets.logo || "/icons/merch-icon.svg",
              title: "Support Artists",
              description:
                "Buy exclusive merchandise directly from your favorite artists",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="tunila-home-feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -10,
                boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
                transition: { duration: 0.3 },
              }}
            >
              <div className="tunila-home-feature-icon">
                <img src={feature.icon} alt={feature.title} loading="lazy" />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section with Card Animation */}
      <section className="tunila-home-testimonials-section">
        <div className="tunila-home-testimonials-content">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            What Our Community Says
          </motion.h2>
          <div className="tunila-home-testimonials-grid">
            {[
              {
                text: "Tunila helped me discover incredible new artists I would have never found elsewhere. The recommendations are spot on!",
                name: "Balen Shah",
                role: "Music Enthusiast, Mayor of Kathmandu",
                avatar: assets.testimonial_avatar1 || "/avatars/user1.jpg",
              },
              {
                text: "As an independent artist, Tunila has given me a platform to share my music with the world and connect with my fans on a deeper level.",
                name: "Sacar.",
                role: "Independent Artist and Professional Hater",
                avatar: assets.testimonial_avatar2 || "/avatars/user2.jpg",
              },
              {
                text: "The merchandise platform made it easy to create and sell custom merch to my fans. It's been a game-changer for my music career.",
                name: "Uniq Poet",
                role: "Verified Artist on Tunila",
                avatar: assets.testimonial_avatar3 || "/avatars/user3.jpg",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="tunila-home-testimonial-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  y: -10,
                  boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
                  transition: { duration: 0.3 },
                }}
              >
                <div className="tunila-home-quote-mark">"</div>
                <p className="tunila-home-testimonial-text">
                  {testimonial.text}
                </p>
                <div className="tunila-home-testimonial-author">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="tunila-home-testimonial-avatar"
                    loading="lazy"
                  />
                  <div>
                    <p className="tunila-home-author-name">
                      {testimonial.name}
                    </p>
                    <p className="tunila-home-author-role">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <motion.div
          className="about-cta-content"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
        >
          <h2>Ready to Make Waves?</h2>
          <p>Join Nepal's fastest growing music community today</p>
          <div className="about-cta-buttons">
            <Link to="/login" className="about-cta-btn about-cta-primary">
              Start Listening
            </Link>
            <Link
              to="/upload-music"
              className="about-cta-btn about-cta-secondary"
            >
              Upload Your Music
            </Link>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
};

export default TunilaHome;
