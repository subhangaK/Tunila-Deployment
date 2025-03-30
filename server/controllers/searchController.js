import Song from "../models/songModel.js";
import User from "../models/userModel.js";
import Merchandise from "../models/merchandiseModel.js";
import Playlist from "../models/playlistModel.js";

export const searchAll = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query required",
      });
    }

    // Search Songs
    const songs = await Song.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { artist: { $regex: query, $options: "i" } },
        { genre: { $regex: query, $options: "i" } },
      ],
    }).limit(10);

    // Search Merchandise
    const merchandise = await Merchandise.find({
      $and: [
        { stock: { $gt: 0 } },
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { type: { $regex: query, $options: "i" } },
          ],
        },
      ],
    })
      .populate("artist", "name profilePicture")
      .limit(5);

    // Search Artists
    const artistIds = [
      ...new Set(songs.map((song) => song.artistId)),
      ...new Set(merchandise.map((item) => item.artist)),
    ];

    const artists = await User.find({
      $and: [
        { _id: { $in: artistIds } },
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
      ],
    }).limit(5);

    // Search Users
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    }).limit(5);

    // Search Playlists
    const playlists = await Playlist.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { songs: { $in: songs.map((song) => song._id) } },
      ],
      isPublic: true,
    })
      .populate("songs")
      .limit(5);

    // Process songs with related tracks
    const songsWithRelated = await Promise.all(
      songs.map(async (song) => {
        const related = await Song.find({
          artistId: song.artistId,
          _id: { $ne: song._id },
        }).limit(3);
        return {
          ...song.toObject(),
          related,
          artist: await User.findById(song.artistId),
        };
      })
    );

    res.status(200).json({
      success: true,
      results: {
        songs: songsWithRelated,
        merchandise,
        artists,
        users,
        playlists,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const searchMerchandise = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query required",
      });
    }

    const merchandise = await Merchandise.find({
      $and: [
        { stock: { $gt: 0 } }, // Only items with stock
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
            { type: { $regex: query, $options: "i" } },
          ],
        },
      ],
    })
      .populate("artist", "name profilePicture")
      .limit(20); // Limit results

    res.status(200).json({
      success: true,
      results: merchandise,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
