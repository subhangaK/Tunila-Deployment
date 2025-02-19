import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const MerchItem = ({ item }) => {
  const { backendUrl, userData, isLoggedin, getUserData } = useContext(AppContext);
  const navigate = useNavigate();
  
  // Check wishlist status using both user's wishlist and merchandise's wishlistedBy
  const isInWishlist = userData?.wishlist?.includes(item._id) || 
    item.wishlistedBy?.includes(userData?._id);
  
  const handleBuy = async () => {
    if (!isLoggedin) {
      toast.error("Please login to purchase items");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/merch/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ merchId: item._id, quantity: 1 })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment initiation failed');
      }

      const data = await response.json();
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast.error(data.message || 'Payment initiation failed');
      }
    } catch (error) {
      toast.error(error.message || 'Payment initiation failed');
    }
  };

  const handleWishlist = async (itemId) => {
    if (!isLoggedin) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/merch/${itemId}/wishlist`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Wishlist updated successfully');
        // Refresh user data to update wishlist status
        await getUserData();
      } else {
        toast.error(data.message || 'Failed to update wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleItemClick = () => {
    navigate(`/merch/${item._id}`);
  };

  return (
    <div className="merch-item">
      <div className="merch-image-container">
        <Link to={`/merch/${item._id}`}>
          <img 
            src={`${backendUrl}${item.images[0]}`} 
            alt={item.name}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = assets.placeholder_image || '/placeholder.png';
            }}
          />
        </Link>
      </div>
      <div className="merch-details">
        <h3>{item.name}</h3>
        {item.artist && (
          <div className="artist-name">
            By: <span>{item.artist.name}</span>
          </div>
        )}
        <div className="price-tag">Rs {item.price}</div>
        <div className="merch-type-badge">
          {item.type === 'digital' ? 'Digital Item' : 'Physical Item'}
        </div>
        <div className="actions">
          <button 
            onClick={handleBuy} 
            className="buy-button"
            disabled={!item.stock || item.stock <= 0}
          >
            {item.stock && item.stock > 0 ? 'Buy Now' : 'Out of Stock'}
          </button>
          <img 
            className="wishlist-image"
            onClick={() => handleWishlist(item._id)}
            src={isInWishlist ? assets.liked_icon : assets.notliked_icon}
            alt={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          />
        </div>
      </div>
    </div>
  );
};

export default MerchItem;