import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      req.userId = tokenDecode.id; // Attach userId to the req object
    } else {
      return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export default userAuth;
