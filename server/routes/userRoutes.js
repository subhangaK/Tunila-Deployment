import express from 'express';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js'; // Import admin middleware
import { getUserData, getAllUsers, deleteUser } from '../controllers/userController.js';

const userRouter = express.Router();

// Route to get logged-in user data (All users can access this)
userRouter.get('/data', userAuth, getUserData);

// ADMIN ROUTES (Only accessible to admins)
userRouter.get('/all-users', userAuth, adminAuth, getAllUsers); // Get all users
userRouter.delete('/delete/:id', userAuth, adminAuth, deleteUser); // Delete user

export default userRouter;
