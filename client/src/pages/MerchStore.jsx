import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import MerchItem from "../components/MerchItem";
import MerchForm from "../components/MerchForm";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import "../css/MerchStore.css";

const MerchStore = () => {
  const { backendUrl, userData, isLoggedin } = useContext(AppContext);
  const [merch, setMerch] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [artistMerch, setArtistMerch] = useState({});
  const [topWishlisted, setTopWishlisted] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Refs for scroll animations
  const featuredRef = useRef(null);
  const artistSectionsRef = useRef(null);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);

      // Check if elements are in viewport for animations
      const elements = [featuredRef, artistSectionsRef];
      elements.forEach((ref) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const isVisible =
            rect.top < window.innerHeight * 0.8 && rect.bottom >= 0;
          if (isVisible) {
            ref.current.classList.add("merch-section-in-view");
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchMerch = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${backendUrl}/api/merch`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();
        setMerch(data);

        // Group merchandise by artist
        const groupedByArtist = {};
        const artistInfo = new Map();

        // Process all merchandise items
        await Promise.all(
          data.map(async (item) => {
            if (item.artist && item.artist._id) {
              // If we haven't fetched this artist's info yet
              if (!artistInfo.has(item.artist._id)) {
                try {
                  // Fetch artist profile details
                  const artistResponse = await fetch(
                    `${backendUrl}/api/user/profile/${item.artist._id}`,
                    { credentials: "include" }
                  );
                  if (artistResponse.ok) {
                    const artistData = await artistResponse.json();
                    artistInfo.set(item.artist._id, {
                      name: artistData.userProfile.name,
                      profilePicture: artistData.userProfile.profilePicture,
                      _id: item.artist._id,
                    });
                  }
                } catch (error) {
                  console.error("Error fetching artist data:", error);
                }
              }

              // Add to grouped merch
              if (!groupedByArtist[item.artist._id]) {
                groupedByArtist[item.artist._id] = [];
              }
              groupedByArtist[item.artist._id].push(item);
            }
          })
        );

        // Set artist info in the grouped merch object
        Object.keys(groupedByArtist).forEach((artistId) => {
          if (artistInfo.has(artistId)) {
            groupedByArtist[artistId].artistInfo = artistInfo.get(artistId);
          }
        });

        setArtistMerch(groupedByArtist);

        // Sort items by wishlist count for top wishlisted section
        const sortedByWishlist = [...data].sort(
          (a, b) =>
            (b.wishlistedBy?.length || 0) - (a.wishlistedBy?.length || 0)
        );
        setTopWishlisted(sortedByWishlist.slice(0, 4));
      } catch (error) {
        console.error("Error fetching merchandise:", error);
        toast.error("Failed to load merchandise. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerch();
  }, [backendUrl]);

  const handleSellItemClick = () => {
    if (!isLoggedin) {
      toast.error("Please log in to sell items");
      return;
    }

    if (!userData?.canSellMerch) {
      toast.error(
        "You need to be a verified artist to sell items. Please upload music and verify your account first."
      );
      return;
    }

    setShowForm(true);
  };

  const refreshMerchandise = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/merch`);
      const data = await response.json();
      setMerch(data);

      // Re-sort for top wishlisted
      const sortedByWishlist = [...data].sort(
        (a, b) => (b.wishlistedBy?.length || 0) - (a.wishlistedBy?.length || 0)
      );
      setTopWishlisted(sortedByWishlist.slice(0, 4));
    } catch (error) {
      console.error("Error refreshing merchandise:", error);
    }
  };

  return (
    <div className="merch-store-page">
      {/* Hero Section */}
      <section className="merch-hero">
        <div className="merch-hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Tunila Merch Store
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Exclusive merchandise from your favorite artists
          </motion.p>
          {userData?.canSellMerch && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className={`sell-button ${showForm ? "cancel-button" : ""}`}
              onClick={handleSellItemClick}
            >
              {showForm ? "Cancel" : "Sell Your Merch"}
            </motion.button>
          )}
        </div>
        <div className="merch-hero-overlay"></div>
      </section>

      <div className="merch-container">
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="merch-form-container"
          >
            <MerchForm
              setShowForm={setShowForm}
              onSuccess={refreshMerchandise}
            />
          </motion.div>
        )}

        {isLoading ? (
          <div className="merch-loading">
            <div className="merch-loading-spinner"></div>
            <p>Loading amazing merchandise...</p>
          </div>
        ) : (
          <>
            {/* Top Wishlisted Section */}
            {topWishlisted.length > 0 && (
              <section
                ref={featuredRef}
                className="merch-featured-section merch-animate-fadein"
              >
                <div className="merch-section-header">
                  <h2>Most Wishlisted Items</h2>
                  <div className="merch-section-line"></div>
                </div>
                <p className="merch-section-subtitle">
                  Our community's favorite merchandise
                </p>

                <div className="featured-merch-grid">
                  {topWishlisted.map((item, index) => (
                    <motion.div
                      key={item._id}
                      className="featured-merch-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{
                        y: -10,
                        boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
                        transition: { duration: 0.3 },
                      }}
                    >
                      <MerchItem
                        item={item}
                        onWishlistUpdate={refreshMerchandise}
                      />
                      <div className="merch-trending-badge">Trending</div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Artist Sections */}
            <section
              ref={artistSectionsRef}
              className="artist-merch-sections merch-animate-fadein"
            >
              <div className="merch-section-header">
                <h2>Shop By Artist</h2>
                <div className="merch-section-line"></div>
              </div>

              {Object.keys(artistMerch).length > 0 ? (
                Object.keys(artistMerch).map((artistId, index) => {
                  const artistItems = artistMerch[artistId];
                  const artistInfo = artistItems.artistInfo;

                  if (!artistItems.length || !artistInfo) return null;

                  return (
                    <motion.div
                      key={artistId}
                      className="artist-merch-section"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="artist-section-header">
                        <div className="artist-profile">
                          <img
                            src={`${backendUrl}${artistInfo.profilePicture}`}
                            alt={artistInfo.name}
                            className="artist-profile-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-profile.png";
                            }}
                          />
                          <div className="artist-info">
                            <h3>{artistInfo.name}</h3>
                            <Link
                              to={`/artist/${artistInfo._id}/merch`}
                              className="view-all-link"
                            >
                              View All Merch <span className="arrow">→</span>
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="artist-merch-grid">
                        {artistItems.slice(0, 4).map((item, itemIndex) => (
                          <motion.div
                            key={item._id}
                            className="artist-merch-item"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: itemIndex * 0.05,
                            }}
                            whileHover={{
                              y: -5,
                              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                              transition: { duration: 0.2 },
                            }}
                          >
                            <MerchItem
                              item={item}
                              onWishlistUpdate={refreshMerchandise}
                            />
                          </motion.div>
                        ))}
                      </div>

                      {artistItems.length > 4 && (
                        <div className="see-more-container">
                          <Link
                            to={`/artist/${artistId}/merch`}
                            className="see-more-button"
                          >
                            See More Items
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <div className="no-items-message">
                  <p>No artist merchandise available at the moment.</p>
                  {userData?.canSellMerch && (
                    <p>Be the first to list an item in our store!</p>
                  )}
                </div>
              )}
            </section>

            {/* Join CTA Section */}
            <section className="merch-cta-section">
              <div className="merch-cta-content">
                <h2>Join The Tunila Community</h2>
                <p>
                  Support your favorite artists directly and get exclusive
                  merchandise
                </p>
                <div className="merch-cta-buttons">
                  <Link
                    to="/featured-artists"
                    className="merch-cta-button secondary"
                  >
                    Explore Artists
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MerchStore;
