import express from "express";
import axios from "axios";
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

// Fetch recommendations for logged-in user
router.get("/:userId", userAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Call Python API for recommendations
    const response = await axios.get(`http://127.0.0.1:5000/api/recommend/${userId}`);

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ success: false, message: "Error fetching recommendations" });
  }
});

export default router;
