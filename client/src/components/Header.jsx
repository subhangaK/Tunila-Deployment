// Header.jsx (simplified)
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Logo from "../assets/Tunila.png";
import Search from "../assets/search.png";
import { FaBars } from "react-icons/fa";

function Header({ toggleSidebar }) {
  const navigate = useNavigate();
  const { userData, setUserData, setIsLoggedin, backendUrl } =
    useContext(AppContext);
  const [header_menuVisible, setHeader_MenuVisible] = useState(false);
  const [header_searchQuery, setHeader_SearchQuery] = useState("");

  // Header Functions
  const header_logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const header_sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp"
      );
      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const header_handleSearchChange = (e) => {
    setHeader_SearchQuery(e.target.value);
  };

  const header_handleSearchSubmit = (e) => {
    if (e.key === "Enter" && header_searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(header_searchQuery.trim())}`);
      setHeader_SearchQuery("");
    }
  };

  const header_goToHome = () => {
    navigate("/home");
  };

  return (
    <div className="header-container">
      <div className="header-menu-toggle" onClick={toggleSidebar}>
        <FaBars className="header-menu-icon" />
      </div>

      <div className="header-logo-container" onClick={header_goToHome}>
        <img className="header-logo" src={Logo} alt="Tunila Logo" />
        <span className="header-logo-text">Tunila</span>
      </div>

      <div className="header-search-container">
        <img className="header-search-icon" src={Search} alt="Search Icon" />
        <input
          className="header-search-box"
          type="text"
          placeholder="Search for music, artists, and playlists..."
          value={header_searchQuery}
          onChange={header_handleSearchChange}
          onKeyDown={header_handleSearchSubmit}
        />
      </div>

      <div className="header-welcome">
        <h2>Welcome to Tunila, {userData ? userData.name : "User"}</h2>
      </div>

      {userData ? (
        <div
          className="header-profile-container"
          onClick={() => setHeader_MenuVisible(!header_menuVisible)}
        >
          <img
            className="header-profile-picture"
            src={`${backendUrl}${
              userData.profilePicture || "/uploads/profile_pictures/default.png"
            }`}
            alt="Profile"
          />
          {header_menuVisible && (
            <ul className="header-dropdown-menu">
              <li
                className="header-dropdown-item"
                onClick={() => navigate(`/profile/${userData.userId}`)}
              >
                Profile
              </li>

              {userData.role === "admin" && (
                <li
                  className="header-dropdown-item"
                  onClick={() => navigate("/admin")}
                >
                  Admin Dashboard
                </li>
              )}

              {!userData.isAccountVerified && (
                <li
                  className="header-dropdown-item"
                  onClick={header_sendVerificationOtp}
                >
                  Verify Email
                </li>
              )}
              <li
                className="header-dropdown-item header-logout"
                onClick={header_logout}
              >
                Log out
              </li>
            </ul>
          )}
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="header-login-button"
        >
          Sign Up
        </button>
      )}
    </div>
  );
}

export default Header;
