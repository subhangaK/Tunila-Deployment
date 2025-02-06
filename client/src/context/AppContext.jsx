import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const recommendationApiUrl = "http://127.0.0.1:5000/api/recommend"; // Python API URL

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [likedSongs, setLikedSongs] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Admin Only
  const [allSongs, setAllSongs] = useState([]); // Admin Only
  const [recommendedSongs, setRecommendedSongs] = useState([]); // Store recommended songs

  // Check if user is authenticated
  const getAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`);
      if (data.success) {
        setIsLoggedin(true);
        getUserData();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch user data, role, and liked songs
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      if (data.success) {
        setUserData(data.userData);
        getLikedSongs(data.userData._id);
        fetchRecommendedSongs(data.userData._id); // Fetch recommendations for the user

        if (data.userData.role === "admin") {
          fetchUsers();
          fetchSongs();
        }

        // Fetch recommendations only after user data is available
        if (data.userData._id) {
          fetchRecommendedSongs(data.userData._id);
        }
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

  // ✅ Fetch recommended songs from Python API
  const fetchRecommendedSongs = async (userId) => {
    if (!userId) {
      console.warn("User ID is undefined, skipping recommendation request.");
      return;
    }

    try {
      const { data } = await axios.get(`${recommendationApiUrl}/${userId}`);
      if (data.success) {
        setRecommendedSongs(data.recommended_songs); // Store recommendations in state
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
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
      fetchRecommendedSongs(userData._id); // Refresh recommendations after like change
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  // Fetch all users (Admin Only)
  const fetchUsers = async () => {
    if (userData?.role !== "admin") return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/users`);
      setAllUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch all songs (Admin Only)
  const fetchSongs = async () => {
    if (userData?.role !== "admin") return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/songs`);
      setAllSongs(data.songs);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  // Delete user (Admin Only)
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${backendUrl}/api/admin/users/${userId}`);
      toast.success("User deleted.");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  // Delete song (Admin Only)
  const deleteSong = async (songId) => {
    try {
      await axios.delete(`${backendUrl}/api/admin/songs/${songId}`);
      toast.success("Song deleted.");
      fetchSongs();
    } catch (error) {
      console.error("Error deleting song:", error);
      toast.error("Failed to delete song.");
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
    allUsers,
    allSongs,
    recommendedSongs, // Added recommended songs to context
    fetchUsers,
    fetchSongs,
    fetchRecommendedSongs, // Added function to fetch recommended songs
    deleteUser,
    deleteSong,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
