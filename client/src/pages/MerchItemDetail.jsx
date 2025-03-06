import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Header from "../components/Header";
import { toast } from "react-toastify";
import { FaArrowLeft, FaHeart, FaRegHeart } from "react-icons/fa";
import "../css/MerchItemDetail.css";

const MerchItemDetail = () => {
  const { itemId } = useParams();
  const { backendUrl, userData, isLoggedin, getUserData } =
    useContext(AppContext);
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [artistItems, setArtistItems] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch the current item
        const itemRes = await fetch(`${backendUrl}/api/merch/${itemId}`, {
          credentials: "include", // Use consistent auth method
        });

        if (!itemRes.ok) {
          const errorData = await itemRes.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch item details");
        }

        const itemData = await itemRes.json();
        setItem(itemData);

        // Set initial selected image
        if (itemData.images && itemData.images.length > 0) {
          setSelectedImage(0);
        }

        // Check if item is in user's wishlist
        if (isLoggedin && userData) {
          setIsInWishlist(
            userData.wishlist?.includes(itemId) ||
              itemData.wishlistedBy?.includes(userData._id)
          );
        }

        // Fetch items from the same artist
        if (itemData.artist && itemData.artist._id) {
          const artistRes = await fetch(
            `${backendUrl}/api/merch/artist/${itemData.artist._id}`,
            {
              credentials: "include",
            }
          );

          if (artistRes.ok) {
            const artistItemsData = await artistRes.json();
            // Filter out the current item
            const otherArtistItems = artistItemsData.filter(
              (item) => item._id !== itemId
            );
            setArtistItems(otherArtistItems.slice(0, 5));
          }
        }

        // Fetch other related items (same type)
        const allItemsRes = await fetch(`${backendUrl}/api/merch`, {
          credentials: "include",
        });

        if (allItemsRes.ok) {
          const allItems = await allItemsRes.json();
          // Filter for items of the same type but different artist
          const relatedByType = allItems.filter(
            (relItem) =>
              relItem.type === itemData.type &&
              relItem._id !== itemId &&
              relItem.artist?._id !== itemData.artist?._id
          );
          setRelatedItems(relatedByType.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
        setError(error.message || "Error loading item details");
        toast.error(error.message || "Error loading item details");
        setItem(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (itemId) {
      fetchItemDetails();
    }
  }, [itemId, backendUrl, isLoggedin, userData]);

  const handleWishlist = async () => {
    if (!isLoggedin) {
      toast.info("Please login to add items to your wishlist");
      return;
    }

    try {
      const response = await fetch(
        `${backendUrl}/api/merch/${itemId}/wishlist`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (response.ok) {
        setIsInWishlist(result.inWishlist);
        toast.success(result.message);
        await getUserData(); // Refresh user data to update wishlist
      } else {
        toast.error(result.message || "Failed to update wishlist");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Error updating wishlist");
    }
  };

  const handleBuy = async () => {
    if (!isLoggedin) {
      toast.info("Please login to purchase items");
      if (!item.stock || item.stock <= 0) {
        toast.error("This item is out of stock");
        return;
      }
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/merch/payment/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          merchId: itemId,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (response.ok && data.payment_url) {
        // Redirect to Khalti payment page
        window.location.href = data.payment_url;
      } else {
        toast.error(data.message || "Payment initiation failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Error initiating payment");
    }
  };

  const renderItemCard = (item) => (
    <div
      className="related-item-card"
      onClick={() => navigate(`/merch/${item._id}`)}
    >
      <div className="related-item-image">
        <img src={`${backendUrl}${item.images[0]}`} alt={item.name} />
      </div>
      <div className="related-item-info">
        <h4>{item.name}</h4>
        <p className="related-item-price">Rs. {item.price}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading item details...</p>
        </div>
      </>
    );
  }

  if (error || !item) {
    return (
      <>
        <div className="error-container">
          <h2>{error || "Item Not Found"}</h2>
          <button onClick={() => navigate("/merch")}>Back to Store</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="item-detail-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <div className="item-detail-content">
          {/* Left side - Image Gallery */}
          <div className="item-images">
            <div className="main-image">
              <img
                src={`${backendUrl}${item.images[selectedImage]}`}
                alt={item.name}
              />
            </div>

            {item.images.length > 1 && (
              <div className="thumbnail-gallery">
                {item.images.map((image, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${
                      selectedImage === index ? "selected" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={`${backendUrl}${image}`}
                      alt={`${item.name} view ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right side - Item Details */}
          <div className="item-info">
            <div className="item-header">
              <h1>{item.name}</h1>
              <button
                className="wishlist-button"
                onClick={handleWishlist}
                aria-label={
                  isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                {isInWishlist ? (
                  <FaHeart className="wishlist-icon active" />
                ) : (
                  <FaRegHeart className="wishlist-icon" />
                )}
              </button>
            </div>

            <div className="item-price">Rs. {item.price}</div>

            <div className="item-artist">
              <span>By:</span>
              <a
                href={`/artist/${item.artist?._id}/merch`}
                className="artist-link"
              >
                {item.artist?.name || "Unknown Artist"}
              </a>
            </div>

            <div className="item-type">
              <span>Category:</span> {item.type}
            </div>

            <div className="item-description">
              <h3>Description</h3>
              <p>{item.description}</p>
            </div>

            <div className="item-availability">
              <span>Availability:</span>{" "}
              {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
            </div>

            <div className="purchase-controls">
              <div className="quantity-control">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(item.stock || 10, quantity + 1))
                  }
                  disabled={quantity >= (item.stock || 10)}
                >
                  +
                </button>
              </div>

              <button
                className="merch-detail-buy-button"
                onClick={handleBuy}
                disabled={!item.stock || item.stock <= 0}
              >
                {item.stock && item.stock > 0 ? "Buy Now" : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>

        {/* More from this artist section */}
        {artistItems.length > 0 && (
          <div className="more-items-section">
            <h2>More from {item.artist?.name}</h2>
            <div className="related-items-grid">
              {artistItems.map((item) => renderItemCard(item))}
            </div>
            {item.artist?._id && (
              <button
                className="view-all-button"
                onClick={() => navigate(`/artist/${item.artist._id}/merch`)}
              >
                View All Items
              </button>
            )}
          </div>
        )}

        {/* Related items section */}
        {relatedItems.length > 0 && (
          <div className="more-items-section">
            <h2>You May Also Like</h2>
            <div className="related-items-grid">
              {relatedItems.map((item) => renderItemCard(item))}
            </div>
            <button
              className="view-all-button"
              onClick={() => navigate("/merch")}
            >
              Browse All Items
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MerchItemDetail;
