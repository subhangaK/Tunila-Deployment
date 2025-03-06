import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import "../css/Sidebar.css";
import {
  FaHome,
  FaSearch,
  FaList,
  FaHeart,
  FaHistory,
  FaPlus,
  FaUserFriends,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaMusic,
  FaUpload,
  FaStore,
  FaUserAlt,
} from "react-icons/fa";

function Sidebar({ onToggleCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useContext(AppContext);
  const [sidebar_collapsed, setSidebar_Collapsed] = useState(false);

  const sidebar_toggleCollapse = () => {
    const newState = !sidebar_collapsed;
    setSidebar_Collapsed(newState);
    if (onToggleCollapse) {
      onToggleCollapse(newState);
    }
  };

  const sidebar_isActive = (path) => {
    // Check if current path matches or starts with the navigation item path
    if (path === "/") {
      return location.pathname === path ? "sidebar-active" : "";
    }
    return location.pathname.startsWith(path) ? "sidebar-active" : "";
  };

  // Navigation items based on your actual routes
  const sidebar_navItems = [
    { path: "/home", name: "Home", icon: <FaHome className="sidebar-icon" /> },
    {
      path: "/search",
      name: "Search",
      icon: <FaSearch className="sidebar-icon" />,
    },
    {
      path: "/playlists",
      name: "Your Playlists",
      icon: <FaList className="sidebar-icon" />,
    },
    {
      path: "/liked-songs",
      name: "Liked Songs",
      icon: <FaHeart className="sidebar-icon" />,
    },
    {
      path: "/featured-artists",
      name: "Featured Artists",
      icon: <FaUserFriends className="sidebar-icon" />,
    },
  ];

  // User-specific items
  const sidebar_userItems = [
    {
      path: "/published-music",
      name: "Your Music",
      icon: <FaMusic className="sidebar-icon" />,
    },
    {
      path: "/upload-music",
      name: "Upload Music",
      icon: <FaUpload className="sidebar-icon" />,
    },
  ];

  // Additional items
  const sidebar_additionalItems = [
    {
      path: "/merch",
      name: "Merch Store",
      icon: <FaStore className="sidebar-icon" />,
    },
    {
      path: userData ? `/profile/${userData.userId}` : "/login",
      name: "Your Profile",
      icon: <FaUserAlt className="sidebar-icon" />,
    },
  ];

  // Admin specific items
  const sidebar_adminItems =
    userData && userData.role === "admin"
      ? [
          {
            path: "/admin",
            name: "Admin Dashboard",
            icon: <FaCog className="sidebar-icon" />,
          },
        ]
      : [];

  return (
    <div
      className={`sidebar-container ${
        sidebar_collapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <div className="sidebar-toggle" onClick={sidebar_toggleCollapse}>
        {sidebar_collapsed ? (
          <FaChevronRight className="sidebar-toggle-icon" />
        ) : (
          <FaChevronLeft className="sidebar-toggle-icon" />
        )}
      </div>

      <div className="sidebar-nav-section">
        <h3
          className={`sidebar-section-title ${
            sidebar_collapsed ? "sidebar-hidden" : ""
          }`}
        >
          Main
        </h3>
        <ul className="sidebar-nav-list">
          {sidebar_navItems.map((item, index) => (
            <li
              key={index}
              className={`sidebar-nav-item ${sidebar_isActive(item.path)}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span
                className={`sidebar-nav-text ${
                  sidebar_collapsed ? "sidebar-hidden" : ""
                }`}
              >
                {item.name}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {userData && (
        <>
          <div className="sidebar-nav-section">
            <h3
              className={`sidebar-section-title ${
                sidebar_collapsed ? "sidebar-hidden" : ""
              }`}
            >
              Your Content
            </h3>
            <ul className="sidebar-nav-list">
              {sidebar_userItems.map((item, index) => (
                <li
                  key={index}
                  className={`sidebar-nav-item ${sidebar_isActive(item.path)}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span
                    className={`sidebar-nav-text ${
                      sidebar_collapsed ? "sidebar-hidden" : ""
                    }`}
                  >
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {sidebar_adminItems.length > 0 && (
            <div className="sidebar-nav-section">
              <h3
                className={`sidebar-section-title ${
                  sidebar_collapsed ? "sidebar-hidden" : ""
                }`}
              >
                Admin
              </h3>
              <ul className="sidebar-nav-list">
                {sidebar_adminItems.map((item, index) => (
                  <li
                    key={index}
                    className={`sidebar-nav-item ${sidebar_isActive(
                      item.path
                    )}`}
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span
                      className={`sidebar-nav-text ${
                        sidebar_collapsed ? "sidebar-hidden" : ""
                      }`}
                    >
                      {item.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="sidebar-bottom-section">
        <ul className="sidebar-nav-list">
          {sidebar_additionalItems.map((item, index) => (
            <li
              key={index}
              className={`sidebar-nav-item ${sidebar_isActive(item.path)}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span
                className={`sidebar-nav-text ${
                  sidebar_collapsed ? "sidebar-hidden" : ""
                }`}
              >
                {item.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
