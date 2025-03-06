import express from "express";
import axios from "axios";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// Function to fetch recommendations with fallback
const fetchRecommendations = async (userId) => {
  const hostedApiUrl = `https://tunila-music-recommendation-system.onrender.com/api/recommend/${userId}`;
  const localApiUrl = `http://127.0.0.1:5000/api/recommend/${userId}`;

  try {
    // Try the hosted API first
    const response = await axios.get(hostedApiUrl);
    return response.data;
  } catch (error) {
    console.error("Hosted API failed, falling back to local API:", error);
    // If hosted API fails, try the local API
    const response = await axios.get(localApiUrl);
    return response.data;
  }
};

// Fetch recommendations for logged-in user
router.get("/:userId", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Call the fetchRecommendations function
    const recommendations = await fetchRecommendations(userId);

    res.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching recommendations" });
  }
});

export default router;
