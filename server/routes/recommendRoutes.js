import express from "express";
import axios from "axios";
import userAuth from "../middleware/userAuth.js";
import Song from "../models/songModel.js";

const router = express.Router();

// Helper function to get songs by IDs
const getSongsByIds = async (songIds) => {
  try {
    const songs = await Song.find({ _id: { $in: songIds } });
    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
    return [];
  }
};

router.get("/:userId", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Fallback to local recommendation service
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/api/recommend/${userId}`
      );

      if (response.data.success) {
        // Get full song details from our database
        const recommendedSongs = await getSongsByIds(
          response.data.recommended_songs
        );
        return res.json({
          success: true,
          recommendedSongs,
        });
      }
    } catch (localError) {
      console.log("Local recommendation service also failed");
    }

    // Final fallback - return some popular songs
    const popularSongs = await Song.find().sort({ likedBy: -1 }).limit(10);

    return res.json({
      success: true,
      recommendedSongs: popularSongs,
    });
  } catch (error) {
    console.error("Error in recommendation route:", error);
    res.status(500).json({
      success: false,
      message: "Error getting recommendations",
    });
  }
});

export default router;
