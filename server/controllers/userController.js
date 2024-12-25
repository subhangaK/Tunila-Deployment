import User from '../models/userModel.js';

export const getUserData = async (req, res) => {
  try {
    // Access userId from req.userId (set by userAuth middleware)
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Respond with user data
    res.status(200).json({
      success: true,
      userData: {
        userId: user._id,
        name: user.name,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
