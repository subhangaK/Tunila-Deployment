import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import MerchItem from '../components/MerchItem';
import MerchForm from '../components/MerchForm';
import Header from '../components/Header';
import "../css/ArtistMerchPage.css";
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const ArtistMerchPage = () => {
  const { userId } = useParams();
  const { backendUrl, userData, isLoggedin } = useContext(AppContext);
  const [merch, setMerch] = useState([]);
  const [artist, setArtist] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch artist profile
        const artistRes = await axios.get(`${backendUrl}/api/user/profile/${userId}`);
        setArtist(artistRes.data.userProfile);

        // Fetch artist merchandise
        const merchRes = await axios.get(`${backendUrl}/api/merch/artist/${userId}`);
        setMerch(merchRes.data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(merchRes.data.map(item => item.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load artist merchandise. Please try again.');
        toast.error('Error loading artist merchandise');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, backendUrl]);

  const isCurrentArtist = isLoggedin && userData?.userId === userId;

  const handleAddItem = (newItem) => {
    setMerch([...merch, newItem]);
    setShowForm(false);
    toast.success('New merchandise added successfully!');
  };

  const handleItemClick = () => {
    navigate(`/merch/${item._id}`);
  };

  const filteredMerch = selectedCategory === 'all' 
    ? merch 
    : merch.filter(item => item.category === selectedCategory);

  if (isLoading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="ArtistMerchPage">
      <Header />
      <div className="artist-merch-container">
        {/* Artist Profile Section */}
        <div className="artist-profile-section">
          <div className="artist-profile-wrapper">
            <img
              src={`${backendUrl}${artist?.profilePicture || assets.default_avatar}`}
              alt={artist?.name}
              className="artist-profile-picture"
            />
            <div className="artist-profile-details">
              <h1 className="artist-name">
                {artist?.name}
                {artist?.isAccountVerified && (
                  <img 
                    src={assets.verified_icon} 
                    alt="Verified" 
                    className="artist-verified-badge" 
                  />
                )}
              </h1>
              <p className="artist-bio">{artist?.bio || "Music Artist"}</p>
              <p className="merch-count">{merch.length} items available in store</p>
            </div>
          </div>
          
          {isCurrentArtist && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="add-merch-button"
            >
              {showForm ? 'Cancel' : 'Add New Merchandise'}
            </button>
          )}
        </div>

        {/* Merchandise Form */}
        {showForm && (
          <div className="merch-form-container">
            <MerchForm onSuccess={handleAddItem} setShowForm={setShowForm} />
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="category-filter">
            <h3>Filter by Category:</h3>
            <div className="category-buttons">
              <button 
                className={selectedCategory === 'all' ? 'active' : ''}
                onClick={() => setSelectedCategory('all')}
              >
                All Items
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  className={selectedCategory === category ? 'active' : ''}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Merchandise Grid */}
        {filteredMerch.length === 0 ? (
          <div className="no-merch-message">
            <p>No merchandise available{selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}.</p>
            {isCurrentArtist && <p>Start by adding your first merchandise item!</p>}
          </div>
        ) : (
          <div className="merch-grid">
            {filteredMerch.map(item => (
              <MerchItem 
                onClick={handleItemClick}
                key={item._id} 
                item={item}
                isOwner={isCurrentArtist}
                backendUrl={backendUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistMerchPage;