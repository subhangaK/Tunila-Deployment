import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  merch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Merchandise",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pidx: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["initiated", "completed", "failed"],
    default: "initiated",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
