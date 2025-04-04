import express from "express";
import {
  getAllUsers,
  getAllSongs,
  deleteUser,
  deleteSong,
  deactivateUser,
  reactivateUser,
} from "../controllers/adminController.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Admin routes
router.get("/users", userAuth, adminAuth, getAllUsers); // View all users
router.get("/songs", userAuth, adminAuth, getAllSongs); // View all songs
router.delete("/users/:userId", userAuth, adminAuth, deleteUser); // Remove a user
router.delete("/songs/:songId", userAuth, adminAuth, deleteSong); // Remove a song
router.put("/users/deactivate/:userId", userAuth, adminAuth, deactivateUser); // Deactiviate User
router.put("/users/reactivate/:userId", userAuth, adminAuth, reactivateUser); // Reactivate User

export default router;
