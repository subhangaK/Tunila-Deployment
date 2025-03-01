// models/merchModel.js
import mongoose from "mongoose";

const merchandiseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, required: true },
  images: [String],
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  stock: { type: Number, default: 1 },
  pidx: { type: String, default: null },
  wishlistedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Ensure the model is registered correctly
const Merchandise =
  mongoose.models.Merchandise ||
  mongoose.model("Merchandise", merchandiseSchema);

export default Merchandise;
