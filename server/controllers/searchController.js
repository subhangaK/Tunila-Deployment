import Song from "../models/songModel.js";
import User from "../models/userModel.js";
import Playlist from "../models/playlistModel.js";

export const searchAll = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ success: false, message: "Search query required" });

    // Search Songs
    const songs = await Song.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { artist: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);

    // Search Artists (Users with songs)
    const artistIds = [...new Set(songs.map(song => song.artistId))];
    const artists = await User.find({
      $and: [
        { _id: { $in: artistIds } },
        { $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]}
      ]
    }).limit(5);

    // Search Users
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).limit(5);

    // Search Playlists
    const playlists = await Playlist.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { songs: { $in: songs.map(song => song._id) } }
      ],
      isPublic: true
    }).populate('songs').limit(5);

    // Get related songs for each found song
    const songsWithRelated = await Promise.all(songs.map(async song => {
      const related = await Song.find({ 
        artistId: song.artistId,
        _id: { $ne: song._id }
      }).limit(3);
      return {
        ...song.toObject(),
        related,
        artist: await User.findById(song.artistId)
      };
    }));

    res.status(200).json({
      success: true,
      results: {
        songs: songsWithRelated,
        artists,
        users,
        playlists
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};