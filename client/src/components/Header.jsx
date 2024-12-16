import React, { useState, useContext } from 'react';
import Logo from '../assets/Tunila.png';
import '../css/Header.css';
import Search from '../assets/search.png';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

function Header({ setFilteredSongs }) {
  const navigate = useNavigate(); // Initialize navigate hook
  const { userData, setUserData, setIsLoggedin, backendUrl } = useContext(AppContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/logout');
      data.success && setIsLoggedin(false);
      data.success && setUserData(false);
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp');
      if (data.success) {
        navigate('email-verify');
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFilteredSongs(query); // Update filtered songs based on query
  };

  // Navigate to home when logo is clicked
  const goToHome = () => {
    navigate('/');
  };

  return (
    <div className="header">
      <div className="logo-container" onClick={goToHome}> 
        <img className="logo" src={Logo} alt="Tunila Logo" />
        <span className="logo-text" onClick={goToHome}>Tunila</span>
      </div>
      <div className="search-container">
        <img className="search-icon" src={Search} alt="Search Icon" />
        <input
          className="search-box"
          type="text"
          placeholder="Search for music, artists and playlists."
          value={searchQuery}
          onChange={handleSearchChange} // Handle search input change
        />
      </div>
      <h2>Hi {userData ? userData.name : 'User'}, Welcome to Tunila</h2>
      {userData ? (
        <div className="uppercase-initial" onClick={toggleMenu}>
          {userData.name[0].toUpperCase()}
          {menuVisible && (
            <ul className="dropdown-menu">
              {!userData.isAccountVerified && <li onClick={sendVerificationOtp}>Verify Email</li>}
              <li onClick={logout}>Log out</li>
            </ul>
          )}
        </div>
      ) : (
        <button onClick={() => navigate('/login')} className="login-button">
          Sign  Up
        </button>
      )}
    </div>
  );
}

export default Header;
