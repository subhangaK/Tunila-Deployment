// src/pages/WishlistPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Header from "../components/Header";
import { toast } from "react-toastify";
import "../css/WishlistPage.css";

const WishlistPage = () => {
  const { backendUrl, userData, isLoggedin } = useContext(AppContext);
  const navigate = useNavigate();

  const [wishlistedItems, setWishlistedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlistedItems = async () => {
      if (!isLoggedin) {
        setError("Please login to view your wishlist");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${backendUrl}/api/merch/wishlist/my-items`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch wishlist");
        }

        const data = await response.json();
        setWishlistedItems(data);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        setError(error.message || "Error loading wishlist");
        toast.error(error.message || "Error loading wishlist");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistedItems();
  }, [backendUrl, isLoggedin]);

  if (isLoading) {
    return (
      <>
        <div className="wishlist-loading-container">
          <div className="wishlist-loader"></div>
          <p>Loading your wishlist...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="wishlist-error-container">
          <h2>{error}</h2>
          {!isLoggedin && (
            <button onClick={() => navigate("/login")}>
              Login to View Wishlist
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="wishlist-page">
        <h1>Your Wishlist</h1>

        {wishlistedItems.length === 0 ? (
          <div className="wishlist-empty-wishlist">
            <p>Your wishlist is empty.</p>
            <button onClick={() => navigate("/merch")}>
              Browse Merchandise
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistedItems.map((item) => (
              <div
                key={item._id}
                className="wishlist-item-card"
                onClick={() => navigate(`/merch/${item._id}`)}
                data-new={item.isNew ? "true" : "false"}
              >
                <div className="wishlist-item-image">
                  <img
                    src={`${backendUrl}${item.images[0]}`}
                    alt={item.name}
                    loading="lazy"
                  />
                </div>
                <div className="wishlist-item-info">
                  <h3>{item.name}</h3>
                  <p className="wishlist-item-price">Rs. {item.price}</p>
                  <div className="item-artist">
                    <span>By:</span>
                    <a
                      href={`/artist/${item.artist?._id}/merch`}
                      className="artist-link"
                    >
                      {item.artist?.name || "Unknown Artist"}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistPage;
