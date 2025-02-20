import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js"; // Import user model

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    console.log("❌ No token found in cookies");
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (!tokenDecode.id) {
      console.log("❌ Token decoding failed:", tokenDecode);
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized. Login Again" });
    }

    // Fetch user from database to get their role
    const user = await userModel.findById(tokenDecode.id);
    if (!user) {
      console.log("❌ User not found in database for ID:", tokenDecode.id);
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    req.userId = user._id.toString(); // Convert to string to match ObjectId in DB
    req.userRole = user.role; // Attach user role to request

    console.log("✅ Authenticated User:", {
      userId: req.userId,
      role: req.userRole,
    });

    next(); // Proceed to next middleware or route handler
  } catch (error) {
    console.log("❌ Error in userAuth middleware:", error);
    res.status(401).json({ success: false, message: error.message });
  }
};

export default userAuth;
