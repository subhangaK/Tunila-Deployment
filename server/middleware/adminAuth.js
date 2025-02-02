import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const adminAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(tokenDecode.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access Denied. Admins Only." });
    }

    req.userId = user._id;
    req.userRole = user.role; // Store role in request
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid Token. Login Again." });
  }
};

export default adminAuth;
