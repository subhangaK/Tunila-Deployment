import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const recommendationApiUrl = "http://127.0.0.1:5000/api/recommend"; // Python API for recommendations

  // ✅ Authentication State
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);

  // ✅ Song & Playlist Data
  const [likedSongs, setLikedSongs] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Admin
  const [allSongs, setAllSongs] = useState([]); // Admin
  const [recommendedSongs, setRecommendedSongs] = useState([]);

  // ✅ Music Player State
  const [queue, setQueue] = useState([]); // Song queue
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off"); // 'off', 'all', 'one'
  const [volume, setVolume] = useState(1);
  const [autoplay, setAutoplay] = useState(true);

  // ✅ Check Authentication State
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

  // ✅ Fetch User Data & Liked Songs
  const getUserData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      if (data.success) {
        setUserData(data.userData);
        getLikedSongs(data.userData._id);
        fetchRecommendedSongs(data.userData._id);

        if (data.userData.role === "admin") {
          fetchUsers();
          fetchSongs();
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Fetch User's Liked Songs
  const getLikedSongs = async (userId) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/songs/liked-songs/${userId}`);
      if (data.likedSongs) {
        setLikedSongs(data.likedSongs.map((song) => song._id));
      }
    } catch (error) {
      console.error("Error fetching liked songs:", error);
    }
  };

  // ✅ Fetch Recommended Songs
  const fetchRecommendedSongs = async (userId) => {
    if (!userId) {
      console.warn("User ID is undefined, skipping recommendation request.");
      return;
    }

    try {
      const { data } = await axios.get(`${recommendationApiUrl}/${userId}`);
      if (data.success) {
        setRecommendedSongs(data.recommended_songs);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  // ✅ Toggle Like/Unlike Song
  const toggleLike = async (songId) => {
    if (!userData) {
      toast.error("You need to log in to like songs!");
      return;
    }

    try {
      if (likedSongs.includes(songId)) {
        await axios.post(`${backendUrl}/api/songs/unlike`, { userId: userData._id, songId });
        setLikedSongs(likedSongs.filter((id) => id !== songId));
      } else {
        await axios.post(`${backendUrl}/api/songs/like`, { userId: userData._id, songId });
        setLikedSongs([...likedSongs, songId]);
      }
      fetchRecommendedSongs(userData._id);
    } catch (error) {
      console.error("Error updating like status:", error);
    }
  };

  // ✅ Queue Management
  const addToQueue = (song) => {
    setQueue((prevQueue) => [...prevQueue, song]);

    if (queue.length === 0) {
      setCurrentTrackIndex(0);
      setIsPlaying(true);
    }
  };

  const removeFromQueue = (index) => {
    setQueue((prevQueue) => prevQueue.filter((_, i) => i !== index));
    if (index < currentTrackIndex) {
      setCurrentTrackIndex((prevIndex) => prevIndex - 1);
    }
  };

  const clearQueue = () => {
    setQueue([]);
    setCurrentTrackIndex(0);
    setIsPlaying(false);
  };

  // ✅ Fetch All Users (Admin)
  const fetchUsers = async () => {
    if (userData?.role !== "admin") return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/users`);
      setAllUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // ✅ Fetch All Songs (Admin)
  const fetchSongs = async () => {
    if (userData?.role !== "admin") return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/songs`);
      setAllSongs(data.songs);
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  // ✅ Delete User (Admin)
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

  // ✅ Delete Song (Admin)
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

  // ✅ Providing State & Functions to Context
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
    recommendedSongs,
    fetchUsers,
    fetchSongs,
    fetchRecommendedSongs,
    deleteUser,
    deleteSong,

    // Music Player State
    queue,
    setQueue,
    currentTrackIndex,
    setCurrentTrackIndex,
    isPlaying,
    setIsPlaying,
    shuffle,
    setShuffle,
    repeat,
    setRepeat,
    volume,
    setVolume,
    autoplay,
    setAutoplay,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
