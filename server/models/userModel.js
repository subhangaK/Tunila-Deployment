// models/userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    verifyOtp: { type: String, default: '' },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },
    resetOtp: { type: String, default: '' },
    resetOtpExpireAt: { type: Number, default: 0 },
    coverImage: { type: String, default: "/uploads/covers/default.png" },
    profilePicture: { type: String, default: "/uploads/profile_pictures/default.png" },
    canSellMerch: { type: Boolean, default: false },
    merchItems: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchandise' 
    }],
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchandise'
    }]
});

// Ensure the model is registered correctly
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;