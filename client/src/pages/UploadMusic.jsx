import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../css/UploadMusic.css';
import Header from '../components/Header';
import { AppContext } from '../context/AppContext'; // Import context
import { assets } from "../assets/assets";


const UploadMusic = () => {
  const { userData } = useContext(AppContext); // Get user data from context
  const navigate = useNavigate(); // Initialize navigate hook
  const [song, setSong] = useState(null);
  const [cover, setCover] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');

  useEffect(() => {
    if (userData) {
      setArtist(userData.name); // Set artist to logged-in user's name
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!song || !cover) {
      toast.error('Please upload both song and cover image.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    const formData = new FormData();
    formData.append('song', song);
    formData.append('cover', cover);
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('genre', genre);

    try {
      const response = await axios.post('http://localhost:4000/api/songs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Music uploaded successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });

      // Optionally reset the form fields
      setSong(null);
      setCover(null);
      setTitle('');
      setArtist('');
      setGenre('');

      // Navigate back to the home page after successful upload
      navigate('/'); // Redirect to the home page ("/")
    } catch (error) {
      toast.error('Failed to upload music. Please try again.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  // Check if the user is verified
  const isVerified = userData?.isAccountVerified;

  return (
    <div>
      <Header />
      {isVerified ? (
        <div className="upload-music-container">
           <div className="upload-header">
            <img
              src={assets.arrow_icon}
              alt="back"
              className="arrow-icon"
              onClick={() => navigate('/')} // Navigate to home when icon is clicked
            />
            <h2 className="upload-music-title">Upload Music</h2>
          </div>
          <form onSubmit={handleSubmit} className="upload-music-form">
            <div className="input-group">
              <label>Song Title</label>
              <input
                type="text"
                placeholder="Enter song title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Artist Name</label>
              <input className='artistname'
                type="text"
                placeholder="Enter artist name"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
                disabled // Disable input if you only want the logged-in user's name
              />
            </div>
            <div className="input-group">
              <label>Genre</label>
              <input
                type="text"
                placeholder="Enter genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Song File</label>
              <input
                type="file"
                onChange={(e) => setSong(e.target.files[0])}
                required
              />
            </div>
            <div className="input-group">
              <label>Cover Image</label>
              <input
                type="file"
                onChange={(e) => setCover(e.target.files[0])}
                required
              />
            </div>
            <button type="submit" className="upload-button">Upload</button>
          </form>
          <ToastContainer />
        </div>
      ) : (
        <div className="not-verified-message">
          <h3>You need to verify your email before uploading music.</h3>
          <h4 className='goback' onClick={() => navigate('/')}>Go Back</h4>
        </div>
      )}
    </div>
  );
};

export default UploadMusic;
