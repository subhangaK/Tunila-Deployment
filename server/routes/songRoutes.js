import express from 'express';
import upload from '../config/multerConfig.js';
import Song from '../models/songModel.js';
import User from '../models/userModel.js';
import userAuth from '../middleware/userAuth.js'; // Import userAuth middleware

const router = express.Router();

// POST route for uploading songs and cover images
router.post(
  "/upload",
  upload.fields([
    { name: "song", maxCount: 1 },
    { name: "cover", maxCount: 1 }
  ]),
  userAuth, // Add authentication middleware
  async (req, res) => {
    try {
      const { title, genre } = req.body;
      const songFile = req.files["song"]?.[0];
      const coverFile = req.files["cover"]?.[0];

      if (!songFile || !coverFile) {
        return res.status(400).json({ success: false, message: "Files are required" });
      }

      // Fetch the logged-in user
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Create the song with artistId
      const song = new Song({
        title,
        artist: user.name, // Use the logged-in user's name
        artistId: user._id, // Use the logged-in user's ID
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

// Like a Song Route
router.post('/like', userAuth, async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.userId; // Get userId from the authenticated user

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

// Unlike a Song Route
router.post('/unlike', userAuth, async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.userId; // Get userId from the authenticated user

    if (!userId || !songId) {
      return res.status(400).json({ success: false, message: "User ID and Song ID are required" });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ success: false, message: "Song not found" });
    }

    // ✅ Ensure userId is a string when filtering
    song.likedBy = song.likedBy.filter(id => id.toString() !== userId.toString());

    await song.save();

    res.status(200).json({ success: true, message: "Song unliked", likedBy: song.likedBy });
  } catch (error) {
    console.error("Error unliking song:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Liked Songs Route
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