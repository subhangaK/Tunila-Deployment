import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import UploadMusic from './pages/UploadMusic.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PlaylistsPage from './pages/PlaylistsPage.jsx';
import PlaylistSongsPage from './pages/PlaylistSongsPage.jsx';
import MusicPlayer from './components/MusicPlayer.jsx';
import LikedSongs from './pages/LikedSongs.jsx';

const App = () => {
  const [currentTrack, setCurrentTrack] = useState(null); // State for the current track

  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home setCurrentTrack={setCurrentTrack} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<EmailVerify />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/upload-music" element={<UploadMusic />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path="/liked-songs" element={<LikedSongs setCurrentTrack={setCurrentTrack} />} />
        <Route
          path="/playlists/:id"
          element={<PlaylistSongsPage setCurrentTrack={setCurrentTrack} />}
        />
      </Routes>
      {currentTrack && <MusicPlayer currentTrack={currentTrack} />}
    </div>
  );
};

export default App;
