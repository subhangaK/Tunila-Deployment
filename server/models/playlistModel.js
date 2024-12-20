import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  isPublic: { type: Boolean, default: false },
  coverImage: { type: String, default: '/uploads/covers/default.png' }, // Default cover
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);

export default Playlist;
