import express from 'express';
import multer from 'multer';
import path from 'path';
import Playlist from '../models/playlistModel.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

// Multer setup for playlist cover uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "./uploads/covers/playlists"; // Store playlist covers in "playlists" subfolder
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Get all public playlists
router.get('/public', async (req, res) => {
  try {
    const playlists = await Playlist.find({ isPublic: true }).populate('songs');
    res.status(200).json({ success: true, playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all playlists created by the logged-in user
router.get('/my-playlists', userAuth, async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is missing" });
    }

    const playlists = await Playlist.find({ owner: userId }).populate('songs');
    res.status(200).json({ success: true, playlists });
  } catch (error) {
    console.error("Error fetching user's playlists:", error);
    res.status(500).json({ success: false, message: "Failed to fetch playlists. Try again later." });
  }
});


// Create a new playlist
router.post('/', userAuth, async (req, res) => {
  const { name, isPublic } = req.body;

  try {
    const newPlaylist = new Playlist({
      name,
      owner: req.userId,
      songs: [],
      isPublic,
      coverImage: "/uploads/covers/playlists/default.png", // Default playlist cover
    });

    await newPlaylist.save();
    res.status(201).json({ success: true, playlist: newPlaylist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add songs to an existing playlist
router.post('/:playlistId/add-songs', userAuth, async (req, res) => {
  const { playlistId } = req.params;
  const { songIds } = req.body; // Expecting an array of song IDs

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    if (playlist.owner.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Only add songs that aren't already in the playlist
    const uniqueSongs = songIds.filter(songId => !playlist.songs.includes(songId));
    playlist.songs = [...playlist.songs, ...uniqueSongs];
    await playlist.save();

    res.status(200).json({ success: true, message: 'Songs added to playlist', playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update playlist details (name, public/private, and cover image)
router.put('/:id', userAuth, upload.single('coverImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isPublic, songs } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Playlist ID is missing" });
    }

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    if (req.file) {
      playlist.coverImage = `/uploads/covers/playlists/${req.file.filename}`;
    }

    if (name) playlist.name = name;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    if (songs) {
      const newSongs = Array.isArray(songs) ? songs : [songs];
      playlist.songs = [...new Set([...playlist.songs.map(String), ...newSongs])];
    }

    await playlist.save();
    res.status(200).json({ success: true, playlist });
  } catch (error) {
    console.error("Error updating playlist:", error);
    res.status(500).json({ success: false, message: "Failed to update playlist. Try again later." });
  }
});

// Get a specific playlist by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await Playlist.findById(id).populate('songs');
    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }
    res.status(200).json({ success: true, playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove a song from a playlist
router.put("/:id/remove-song", userAuth, async (req, res) => {
  const { id } = req.params; // Playlist ID
  const { songId } = req.body; // ID of the song to remove

  try {
    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return res.status(404).json({ success: false, message: "Playlist not found" });
    }

    // Ensure the logged-in user is the owner of the playlist
    if (playlist.owner.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized: Not the owner of the playlist" });
    }

    // Remove the song from the playlist
    playlist.songs = playlist.songs.filter((song) => song.toString() !== songId);

    await playlist.save();

    res.status(200).json({ success: true, message: "Song removed from playlist", playlist });
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


export default router;
