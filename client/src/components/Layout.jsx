import React, { useState, useRef, useEffect, useContext } from "react";
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
  FaHistory,
} from "react-icons/fa";
import { BsBagHeart } from "react-icons/bs";
import { FcLike } from "react-icons/fc";
import { AppContext } from "../context/AppContext";
import "../css/Header.css";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const sidebarRef = useRef(null);
  const { isLoggedin } = useContext(AppContext);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarVisible(false);
      }
    }

    if (sidebarVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarVisible]);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === path ? "sidebar-active" : "";
    }
    return location.pathname.startsWith(path) ? "sidebar-active" : "";
  };

  const navItems = [
    { path: "/", name: "Home", icon: <FaHome className="sidebar-icon" /> },
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
    {
      path: "/order-history",
      name: "Order History",
      icon: <FaHistory className="sidebar-icon" />,
    },
  ];

  const additionalItems = [
    {
      path: "/upload-music",
      name: "Upload Music",
      icon: <FaUpload className="sidebar-icon" />,
    },
  ];

  const handleSidebarItemClick = (path) => {
    navigate(path);
    setSidebarVisible(false);
  };

  return (
    <div className="app-layout">
      <Header toggleSidebar={toggleSidebar} />

      <div className="content-wrapper">
        <div className="main-content">
          <Outlet />
        </div>
      </div>

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

          {isLoggedin && (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Layout;
