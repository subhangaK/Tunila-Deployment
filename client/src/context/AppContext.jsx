import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [likedSongs, setLikedSongs] = useState([]);

  // Check if user is authenticated
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/auth/is-auth");
      if (data.success) {
        setIsLoggedin(true);
        getUserData();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch user data and liked songs
  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/data");
      if (data.success) {
        setUserData(data.userData);
        getLikedSongs(data.userData._id);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch user's liked songs
  const getLikedSongs = async (userId) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/songs/liked-songs/${userId}`);
      if (data.likedSongs) {
        setLikedSongs(data.likedSongs.map((song) => song._id)); // Store only song IDs
      }
    } catch (error) {
      console.error("Error fetching liked songs:", error);
    }
  };

  // Toggle like/unlike song
  const toggleLike = async (songId) => {
    if (!userData) {
      toast.error("You need to log in to like songs!");
      return;
    }

    try {
      if (likedSongs.includes(songId)) {
        // Unlike the song
        await axios.post(`${backendUrl}/api/songs/unlike`, { userId: userData._id, songId });
        setLikedSongs(likedSongs.filter((id) => id !== songId));
      } else {
        // Like the song
        await axios.post(`${backendUrl}/api/songs/like`, { userId: userData._id, songId });
        setLikedSongs([...likedSongs, songId]);
      }
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  useEffect(() => {
    getAuthState();
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    likedSongs,
    toggleLike,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
