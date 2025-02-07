import User from "../models/userModel.js";
import Song from "../models/songModel.js";
import Playlist from "../models/playlistModel.js";

// ✅ Get Logged-in User Data
export const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      userData: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Include role
        isAccountVerified: user.isAccountVerified,
        coverImage: user.coverImage, // Include cover image
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get User Profile Data (Publicly Accessible)
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Get songs uploaded by this user
    const songs = await Song.find({ artistId: userId });

    // Get user's public playlists
    const playlists = await Playlist.find({ 
      owner: userId, 
      isPublic: true 
    }).populate("songs");

    res.status(200).json({
      success: true,
      userProfile: {
        userId: user._id,
        name: user.name,
        isAccountVerified: user.isAccountVerified,
        coverImage: user.coverImage,
        songs,
        playlists
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
};

// ✅ Update User Profile (e.g., Cover Image)
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update cover image if a new file is uploaded
    if (req.file) {
      user.coverImage = `/uploads/covers/users/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      userProfile: {
        userId: user._id,
        name: user.name,
        coverImage: user.coverImage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
};

// ✅ Get All Users (Admin Only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude passwords
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// ✅ Delete a User
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};