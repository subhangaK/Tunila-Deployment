import express from "express";
import {
  submitContactForm,
  getAllContactMessages,
  replyToMessage,
} from "../controllers/contactController.js";
import userAuth from "../middleware/userAuth.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// Public route
router.post("/submit", submitContactForm);

// Admin routes
router.get("/messages", userAuth, adminAuth, getAllContactMessages);
router.post("/reply/:messageId", userAuth, adminAuth, replyToMessage);

export default router;
