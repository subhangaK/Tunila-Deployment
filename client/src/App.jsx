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
import { AppContext } from "./context/AppContext";
import FeaturedArtists from "./pages/FeaturedArtists.jsx";
import SearchResultsPage from "./components/SearchResultsPage";
import MerchStore from "./pages/MerchStore.jsx";
import PaymentVerify from "./pages/PaymentVerify.jsx";
import ArtistMerchPage from "./pages/ArtistMerchPage.jsx";
import MerchItemDetail from "./pages/MerchItemDetail.jsx";
import Layout from "./components/Layout.jsx"; // Import the new Layout component
import WishlistPage from "./pages/WishlistPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import BrowsePlaylistsPage from "./pages/BrowsePlaylistsPage.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";

import "./App.css";

// Payment result components remain the same
const PaymentSuccess = () => {
  return (
    <div className="payment-result">
      <h1>Payment Successful!</h1>
      <p>Your purchase was completed successfully.</p>
      <button onClick={() => (window.location.href = "/merch")}>
        Back to Store
      </button>
    </div>
  );
};

const PaymentFailed = () => {
  return (
    <div className="payment-result">
      <h1>Payment Failed</h1>
      <p>We couldn't process your payment. Please try again.</p>
      <button onClick={() => (window.location.href = "/merch")}>
        Back to Store
      </button>
    </div>
  );
};

const App = () => {
  const {
    queue,
    isPlaying,
    setIsPlaying,
    currentTrackIndex,
    setCurrentTrackIndex,
    addToQueue,
  } = useContext(AppContext);
  const [currentTrack, setCurrentTrack] = useState(null);

  const handleTrackChange = (track) => {
    setCurrentTrack(track);

    if (!queue.some((song) => song._id === track._id)) {
      addToQueue(track);
    }

    const trackIndex = queue.findIndex((song) => song._id === track._id);
    setCurrentTrackIndex(trackIndex >= 0 ? trackIndex : queue.length - 1);

    setIsPlaying(true);
  };

  return (
    <div>
      <ToastContainer />
      <Routes>
        {/* Routes that don't need the layout/header */}
        <Route
          path="/"
          element={<TunilaHome setCurrentTrack={handleTrackChange} />}
        />
        <Route
          path="/login"
          element={<Login setCurrentTrack={handleTrackChange} />}
        />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />

        {/* Routes that use the layout component */}
        <Route element={<Layout />}>
          <Route
            path="/home"
            element={<Home setCurrentTrack={handleTrackChange} />}
          />
          <Route
            path="/admin"
            element={<AdminDashboard setCurrentTrack={handleTrackChange} />}
          />
          <Route path="/upload-music" element={<UploadMusic />} />
          <Route
            path="/playlists"
            element={<PlaylistsPage setCurrentTrack={handleTrackChange} />}
          />
          <Route
            path="/liked-songs"
            element={<LikedSongs setCurrentTrack={handleTrackChange} />}
          />
          <Route
            path="/published-music"
            element={<PublishedMusic setCurrentTrack={handleTrackChange} />}
          />
          <Route
            path="/profile/:userId"
            element={<UserProfilePage setCurrentTrack={handleTrackChange} />}
          />
          <Route
            path="/featured-artists"
            element={<FeaturedArtists setCurrentTrack={handleTrackChange} />}
          />
          <Route
            path="/search"
            element={<SearchResultsPage setCurrentTrack={handleTrackChange} />}
          />
          <Route path="/merch" element={<MerchStore />} />
          <Route path="/browse-playlists" element={<BrowsePlaylistsPage />} />
          <Route path="/payment-verify" element={<PaymentVerify />} />
          <Route path="/merch/:itemId" element={<MerchItemDetail />} />
          <Route path="/artist/:userId/merch" element={<ArtistMerchPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route
            path="/playlists/:id"
            element={<PlaylistSongsPage setCurrentTrack={handleTrackChange} />}
          />
        </Route>
      </Routes>

      {/* Music Player remains the same */}
      {queue.length > 0 && <MusicPlayer />}
    </div>
  );
};

export default App;
