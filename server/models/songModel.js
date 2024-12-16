import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  genre: { type: String, required: true },
  filePath: { type: String, required: true }, // Path to the uploaded song file
  coverImage: { type: String, required: true }, // Path to the cover image
});

const Song = mongoose.model('Song', songSchema);

export default Song;
