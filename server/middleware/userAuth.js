import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";  // Import user model

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (!tokenDecode.id) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again" });
    }

    // Fetch user from database to get their role
    const user = await userModel.findById(tokenDecode.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.userId = user._id;
    req.userRole = user.role;  // Attach user role to request

    next(); // Proceed to next middleware or route handler
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export default userAuth;
