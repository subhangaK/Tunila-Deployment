// Layout.jsx
import React, { useState, useRef, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import {
  FaHome,
  FaSearch,
  FaList,
  FaHeart,
  FaUserFriends,
  FaMusic,
  FaUpload,
  FaStore,
  FaUserAlt,
  FaCog,
  FaChevronLeft,
  FaArchive,
} from "react-icons/fa";
import { BsBagHeart } from "react-icons/bs";
import { FcLike } from "react-icons/fc";
import "../css/Header.css"; // We'll still use this CSS file

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarVisible(false);
      }
    }

    // Add event listener only when sidebar is visible
    if (sidebarVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarVisible]);

  // Sidebar Functions
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === path ? "sidebar-active" : "";
    }
    return location.pathname.startsWith(path) ? "sidebar-active" : "";
  };

  // Navigation Items (moved from Header component)
  const navItems = [
    { path: "/", name: "Home", icon: <FaHome className="sidebar-icon" /> },
    {
      path: "/search",
      name: "Search",
      icon: <FaSearch className="sidebar-icon" />,
    },
    {
      path: "/featured-artists",
      name: "Featured Artists",
      icon: <FaUserFriends className="sidebar-icon" />,
    },
    {
      path: "/published-music",
      name: "Tunes",
      icon: <FaMusic className="sidebar-icon" />,
    },
    {
      path: "/merch",
      name: "Merch Store",
      icon: <FaStore className="sidebar-icon" />,
    },
    {
      path: "/browse-playlists",
      name: "Public Playlists",
      icon: <FaArchive className="sidebar-icon" />,
    },
  ];

  const userItems = [
    {
      path: "/liked-songs",
      name: "Liked Tunes",
      icon: <FcLike className="sidebar-icon" />,
    },
    {
      path: "/playlists",
      name: "Your Playlists",
      icon: <FaList className="sidebar-icon" />,
    },
    {
      path: "/wishlist",
      name: "Wishlisted Merch",
      icon: <BsBagHeart className="sidebar-icon" />,
    },
  ];

  const additionalItems = [
    {
      path: "/upload-music",
      name: "Upload Music",
      icon: <FaUpload className="sidebar-icon" />,
    },

    {
      path: "/profile", // This will be updated dynamically in Header component
      name: "Your Profile",
      icon: <FaUserAlt className="sidebar-icon" />,
    },
  ];

  const handleSidebarItemClick = (path) => {
    navigate(path);
    setSidebarVisible(false);
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <Header toggleSidebar={toggleSidebar} />

      <div className="content-wrapper">
        {/* Main Content */}
        <div className="main-content">
          <Outlet />
        </div>
      </div>

      {/* Sidebar as a floating overlay */}
      {sidebarVisible && (
        <div ref={sidebarRef} className="sidebar-container sidebar-overlay">
          <div className="sidebar-toggle" onClick={toggleSidebar}>
            <FaChevronLeft className="sidebar-toggle-icon" />
          </div>

          <div className="sidebar-nav-section">
            <h3 className="sidebar-section-title">Main</h3>
            <ul className="sidebar-nav-list">
              {navItems.map((item, index) => (
                <li
                  key={index}
                  className={`sidebar-nav-item ${isActive(item.path)}`}
                  onClick={() => handleSidebarItemClick(item.path)}
                >
                  {item.icon}
                  <span className="sidebar-nav-text">{item.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* The context-specific sidebar items will be rendered conditionally in the real component */}
          <div className="sidebar-nav-section">
            <h3 className="sidebar-section-title">Your Content</h3>
            <ul className="sidebar-nav-list">
              {userItems.map((item, index) => (
                <li
                  key={index}
                  className={`sidebar-nav-item ${isActive(item.path)}`}
                  onClick={() => handleSidebarItemClick(item.path)}
                >
                  {item.icon}
                  <span className="sidebar-nav-text">{item.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-bottom-section">
            <ul className="sidebar-nav-list">
              {additionalItems.map((item, index) => (
                <li
                  key={index}
                  className={`sidebar-nav-item ${isActive(item.path)}`}
                  onClick={() => handleSidebarItemClick(item.path)}
                >
                  {item.icon}
                  <span className="sidebar-nav-text">{item.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;
