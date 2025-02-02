import User from "../models/userModel.js";
import Song from "../models/songModel.js";

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
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User deleted successfully" });
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
    if (!song) return res.status(404).json({ success: false, message: "Song not found" });

    res.status(200).json({ success: true, message: "Song deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting song" });
  }
};

