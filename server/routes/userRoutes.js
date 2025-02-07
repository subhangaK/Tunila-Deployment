import express from "express";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";
import { getUserData, getAllUsers, deleteUser, getUserProfile, updateUserProfile } from "../controllers/userController.js";
import multer from "multer";
import path from "path";
import fs from "fs"; // Import the 'fs' module to create directories

const router = express.Router();

// Multer setup for user cover image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = path.join(process.cwd(), "uploads", "covers", "users");
      
      // Create the directory if it doesn't exist
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true }); // recursive: true creates parent directories
      }
      
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const upload = multer({ storage });

// Route to get logged-in user data (All users can access this)
router.get("/data", userAuth, getUserData);

// Route to get a user's profile data (publicly accessible)
router.get("/profile/:userId", getUserProfile);

// Route to update user profile (e.g., cover image)
router.put("/profile", userAuth, upload.single("coverImage"), updateUserProfile);

// ADMIN ROUTES (Only accessible to admins)
router.get("/all-users", userAuth, adminAuth, getAllUsers); // Get all users
router.delete("/delete/:id", userAuth, adminAuth, deleteUser); // Delete user

export default router;