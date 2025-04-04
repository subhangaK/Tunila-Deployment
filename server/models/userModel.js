import mongoose from "mongoose";
import Song from "./songModel.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    verifyOtp: { type: String, default: "" },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Number, default: 0 },
    coverImage: { type: String, default: "/uploads/covers/default.png" },
    profilePicture: {
      type: String,
      default: "/uploads/profile_pictures/default.png",
    },
    canSellMerch: {
      type: Boolean,
      default: false,
      set: function (value) {
        // Additional validation if needed
        if (this.isAccountVerified && !value) {
          return false;
        }
        return value;
      },
    },
    merchItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchandise",
      },
    ],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Merchandise",
      },
    ],
  },
  { timestamps: true }
);

// Add a pre-save hook to verify merch selling eligibility
userSchema.pre("save", async function (next) {
  if (this.isModified("isAccountVerified") && this.isAccountVerified) {
    const songCount = await Song.countDocuments({ artistId: this._id });
    if (songCount >= 1 && !this.canSellMerch) {
      this.canSellMerch = true;
    }
  }
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
