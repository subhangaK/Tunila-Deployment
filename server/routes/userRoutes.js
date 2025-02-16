import express from "express";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";
import { 
    getUserData, 
    getAllUsers, 
    deleteUser, 
    getUserProfile, 
    updateUserProfile 
} from "../controllers/userController.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ✅ Ensure directories exist for uploads
const ensureDirectoryExists = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

// ✅ Set up Multer storage for cover images and profile pictures
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder;
        if (file.fieldname === "coverImage") {
            folder = path.join(process.cwd(), "uploads", "covers", "users");
        } else if (file.fieldname === "profilePicture") {
            folder = path.join(process.cwd(), "uploads", "profile_pictures");
        }

        ensureDirectoryExists(folder);
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// ✅ Configure Multer to handle both profile and cover image uploads
const upload = multer({ storage });

// ✅ Route to get logged-in user data (All users can access this)
router.get("/data", userAuth, getUserData);

// ✅ Route to get a user's profile data (publicly accessible)
router.get("/profile/:userId", getUserProfile);

// ✅ Route to update user profile (cover image & profile picture)
router.put("/profile", userAuth, upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "profilePicture", maxCount: 1 }
]), updateUserProfile);

// ✅ Admin Routes (Only accessible to admins)
router.get("/all-users", userAuth, adminAuth, getAllUsers); // Get all users
router.delete("/delete/:id", userAuth, adminAuth, deleteUser); // Delete user

export default router;
