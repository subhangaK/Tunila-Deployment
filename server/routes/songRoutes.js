import express from 'express';
import upload from '../config/multerConfig.js';
import Song from '../models/songModel.js';

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
    const songs = await Song.find(); // Fetch all songs from the database
    res.status(200).json({ success: true, songs }); // Return songs as response
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
