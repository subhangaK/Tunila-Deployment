import express from 'express';
import upload from '../config/multerConfig.js';
import Song from '../models/songModel.js';
import User from '../models/userModel.js';

const router = express.Router();

// POST route for uploading songs and cover images
router.post(
  "/upload",
  upload.fields([
    { name: "song", maxCount: 1 },
    { name: "cover", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, artist, genre } = req.body;
      const songFile = req.files["song"]?.[0];
      const coverFile = req.files["cover"]?.[0];

      if (!songFile || !coverFile) {
        return res.status(400).json({ success: false, message: "Files are required" });
      }

      const song = new Song({
        title,
        artist,
        genre,
        filePath: `/uploads/songs/${songFile.filename}`,
        coverImage: `/uploads/covers/${coverFile.filename}`,
        likedBy: [] // Initialize an empty array for likes
      });

      await song.save();
      res.status(201).json({ success: true, song });
    } catch (error) {
      console.error("Error in /upload route:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// GET route for fetching all songs
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find();
    res.status(200).json({ success: true, songs });
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// **New Like a Song Route**
router.post('/like', async (req, res) => {
  try {
    const { userId, songId } = req.body;

    if (!userId || !songId) {
      return res.status(400).json({ success: false, message: "User ID and Song ID are required" });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    if (!song.likedBy.includes(userId)) {
      song.likedBy.push(userId);
      await song.save();
    }

    res.status(200).json({ success: true, message: "Song liked", likedBy: song.likedBy });
  } catch (error) {
    console.error("Error liking song:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// **New Unlike a Song Route**
router.post('/unlike', async (req, res) => {
  try {
    const { userId, songId } = req.body;

    if (!userId || !songId) {
      return res.status(400).json({ success: false, message: "User ID and Song ID are required" });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    song.likedBy = song.likedBy.filter(id => id !== userId);
    await song.save();

    res.status(200).json({ success: true, message: "Song unliked", likedBy: song.likedBy });
  } catch (error) {
    console.error("Error unliking song:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// **New Get Liked Songs Route**
router.get('/liked-songs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const likedSongs = await Song.find({ likedBy: userId });

    res.status(200).json({ success: true, likedSongs });
  } catch (error) {
    console.error("Error fetching liked songs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
