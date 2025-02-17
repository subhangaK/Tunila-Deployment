import React, { useState, useContext } from "react";
import { Routes, Route } from "react-router-dom";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import TunilaHome from "./pages/TunilaHome.jsx";
import UploadMusic from "./pages/UploadMusic.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PlaylistsPage from "./pages/PlaylistsPage.jsx";
import PlaylistSongsPage from "./pages/PlaylistSongsPage.jsx";
import MusicPlayer from "./components/MusicPlayer.jsx";
import LikedSongs from "./pages/LikedSongs.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UserProfilePage from "./pages/UserProfilePage";
import PublishedMusic from "./pages/PublishedMusic.jsx";
import { AppContext } from "./context/AppContext";  // ✅ Import AppContext
import FeaturedArtists from "./pages/FeaturedArtists.jsx";
import SearchResultsPage from './components/SearchResultsPage';

const App = () => {
  const { queue, isPlaying, setIsPlaying, currentTrackIndex, setCurrentTrackIndex, addToQueue } = useContext(AppContext);  // ✅ Get addToQueue from AppContext
  const [currentTrack, setCurrentTrack] = useState(null);

  // ✅ Function to handle playing a track and adding to queue
  const handleTrackChange = (track) => {
    setCurrentTrack(track);
    
    // ✅ Add track to queue if not already present
    if (!queue.some((song) => song._id === track._id)) {
      addToQueue(track);
    }

    // ✅ Set index of currently playing song
    const trackIndex = queue.findIndex((song) => song._id === track._id);
    setCurrentTrackIndex(trackIndex >= 0 ? trackIndex : queue.length - 1);
    
    setIsPlaying(true);
  };

  return (
    <div>
      <ToastContainer />
      <Routes>
      <Route path="/" element={<TunilaHome setCurrentTrack={handleTrackChange} />} />
        <Route path="/home" element={<Home setCurrentTrack={handleTrackChange} />} />
        <Route path="/login" element={<Login setCurrentTrack={handleTrackChange} />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminDashboard setCurrentTrack={handleTrackChange} />} />
        <Route path="/upload-music" element={<UploadMusic />} />
        <Route path="/playlists" element={<PlaylistsPage setCurrentTrack={handleTrackChange} />} />
        <Route path="/liked-songs" element={<LikedSongs setCurrentTrack={handleTrackChange} />} />
        <Route path="/published-music" element={<PublishedMusic setCurrentTrack={handleTrackChange} />} />
        <Route path="/profile/:userId" element={<UserProfilePage setCurrentTrack={handleTrackChange} />} />
        <Route path="/featured-artists" element={<FeaturedArtists setCurrentTrack={handleTrackChange} />} />
        <Route path="/search" element={<SearchResultsPage setCurrentTrack={handleTrackChange}  />} />
        <Route
          path="/playlists/:id"
          element={<PlaylistSongsPage setCurrentTrack={handleTrackChange} />}
        />
      </Routes>

      {/* ✅ Ensure MusicPlayer only renders when there are songs in queue */}
      {queue.length > 0 && <MusicPlayer />}
    </div>
  );
};

export default App;
