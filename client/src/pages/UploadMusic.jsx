import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "../css/UploadMusic.css";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const UploadMusic = () => {
  const { userData } = useContext(AppContext);
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [isDraggingSong, setIsDraggingSong] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [fileName, setFileName] = useState("");

  const { backendUrl } = useContext(AppContext);

  useEffect(() => {
    if (userData) {
      setArtist(userData.name);
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!song || !cover) {
      toast.error("Please upload both song and cover image.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const formData = new FormData();
    formData.append("song", song);
    formData.append("cover", cover);
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("genre", genre);

    try {
      const response = await axios.post(
        `${backendUrl}/api/songs/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Music uploaded successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Reset form fields
      setSong(null);
      setCover(null);
      setCoverPreview(null);
      setTitle("");
      setArtist(userData?.name || "");
      setGenre("");
      setFileName("");
    } catch (error) {
      toast.error("Failed to upload music. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Song file handlers
  const handleSongDragOver = (e) => {
    e.preventDefault();
    setIsDraggingSong(true);
  };

  const handleSongDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingSong(false);
  };

  const handleSongDrop = (e) => {
    e.preventDefault();
    setIsDraggingSong(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("audio/")
    );

    if (files.length > 0) {
      setSong(files[0]);
      setFileName(files[0].name);
    }
  };

  const handleSongChange = (e) => {
    if (e.target.files[0]) {
      setSong(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  // Cover image handlers
  const handleCoverDragOver = (e) => {
    e.preventDefault();
    setIsDraggingCover(true);
  };

  const handleCoverDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingCover(false);
  };

  const handleCoverDrop = (e) => {
    e.preventDefault();
    setIsDraggingCover(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      setCover(files[0]);
      previewImage(files[0]);
    }
  };

  const handleCoverChange = (e) => {
    if (e.target.files[0]) {
      setCover(e.target.files[0]);
      previewImage(e.target.files[0]);
    }
  };

  const previewImage = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeCoverImage = () => {
    setCover(null);
    setCoverPreview(null);
  };

  // Check if the user is verified
  const isVerified = userData?.isAccountVerified;

  return (
    <div>
      {isVerified ? (
        <div className="upload-music-container fade-in">
          <div className="upload-header">
            <img
              src={assets.arrow_icon}
              alt="back"
              className="arrow-icon"
              onClick={() => navigate("/home")}
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
              <input
                className="upload-artistname"
                type="text"
                placeholder="Enter artist name"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
                disabled
              />
            </div>
            <div className="input-group">
              <label>Genre</label>
              <input
                type="text"
                placeholder="Enter genre (e.g., Rock, Hip-Hop, Jazz)"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Song File</label>
              <div
                className={`file-upload-area ${
                  isDraggingSong ? "dragging" : ""
                }`}
                onDragOver={handleSongDragOver}
                onDragLeave={handleSongDragLeave}
                onDrop={handleSongDrop}
              >
                <input
                  type="file"
                  onChange={handleSongChange}
                  accept="audio/*"
                  required={!song}
                />
                <p>
                  {fileName
                    ? `Selected: ${fileName}`
                    : "Drag & drop your music file here or click to browse"}
                </p>
              </div>
            </div>

            <div className="input-group">
              <label>Cover Image</label>
              {!coverPreview ? (
                <div
                  className={`file-upload-area ${
                    isDraggingCover ? "dragging" : ""
                  }`}
                  onDragOver={handleCoverDragOver}
                  onDragLeave={handleCoverDragLeave}
                  onDrop={handleCoverDrop}
                >
                  <input
                    type="file"
                    onChange={handleCoverChange}
                    accept="image/*"
                    required={!cover}
                  />
                  <p>Drag & drop your cover art here or click to browse</p>
                </div>
              ) : (
                <div className="image-preview">
                  <div className="preview-item">
                    <img src={coverPreview} alt="Cover preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={removeCoverImage}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="upload-button">
              Upload Track
            </button>
          </form>
          <ToastContainer />
        </div>
      ) : (
        <div className="not-verified-message fade-in">
          <h3>You need to verify your email before uploading music.</h3>
          <h4 className="goback" onClick={() => navigate("/")}>
            Go Back
          </h4>
        </div>
      )}
    </div>
  );
};

export default UploadMusic;
