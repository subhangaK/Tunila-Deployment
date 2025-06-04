import User from "../models/userModel.js";
import Song from "../models/songModel.js";
import {
  ACCOUNT_DEACTIVATION_TEMPLATE,
  ACCOUNT_REACTIVATION_TEMPLATE,
} from "../config/emailTemplates.js";
import transporter from "../config/nodemailer.js";

/**
 * Get all users (Admin Only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }); // Exclude passwords
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

/**
 * Get all songs (Admin Only)
 */
export const getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find();
    res.status(200).json({ success: true, songs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching songs" });
  }
};

/**
 * Delete a user by ID (Admin Only)
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};

/**
 * Delete a song by ID (Admin Only)
 */
export const deleteSong = async (req, res) => {
  try {
    const { songId } = req.params;

    const song = await Song.findByIdAndDelete(songId);
    if (!song)
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });

    res
      .status(200)
      .json({ success: true, message: "Song deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting song" });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User account is already deactivated",
      });
    }

    user.isActive = false;
    await user.save();

    // Send deactivation email notification
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Your Tunila Account Has Been Deactivated",
      html: ACCOUNT_DEACTIVATION_TEMPLATE.replace(
        "{{name}}",
        user.name
      ).replace("{{contactLink}}", "https://tunila.netlify.app/contact-us"),
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "User account deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deactivating user account",
    });
  }
};

/**
 * Reactivate a user account (Admin Only)
 */
export const reactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User account is already active",
      });
    }

    user.isActive = true;
    await user.save();

    // Send reactivation email notification
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Your Tunila Account Has Been Reactivated",
      html: ACCOUNT_REACTIVATION_TEMPLATE.replace(
        "{{name}}",
        user.name
      ).replace("{{contactLink}}", "https://tunila.netlify.app/contact-us"),
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "User account reactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reactivating user account",
    });
  }
};
