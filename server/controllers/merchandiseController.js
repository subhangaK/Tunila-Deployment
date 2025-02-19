// controllers/merchandiseController.js
import mongoose from "mongoose";
import Merchandise from '../models/merchandiseModel.js';
import User from '../models/userModel.js';
import axios from 'axios';

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE_URL = 'https://a.khalti.com/api/v2'; // Updated to correct URL

// Create new merchandise
export const createMerchandise = async (req, res) => {
    try {
      // Use req.userId from the auth middleware
      const user = await User.findById(req.userId);
  
      if (!user || !user.canSellMerch) {
        return res.status(403).json({
          message: "Complete artist verification to sell items",
        });
      }
  
      const { name, description, price, type } = req.body;
      
      // Make sure req.files exists
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "At least one image is required" });
      }
      
      const images = req.files.map((file) => `/uploads/merch/${file.filename}`);
  
      const merch = await Merchandise.create({
        name,
        description,
        price,
        type,
        images,
        artist: user._id,
      });
  
      // Update user's merchItems array
      user.merchItems.push(merch._id);
      await user.save();
  
      res.status(201).json(merch);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// Initiate Khalti payment
export const initiatePayment = async (req, res) => {
  try {
    const { merchId, quantity } = req.body;
    
    // Validate inputs
    if (!merchId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid request data" });
    }
    
    const merch = await Merchandise.findById(merchId);
    if (!merch) {
      return res.status(404).json({ message: "Merchandise not found" });
    }
    
    // Use req.userId from the auth middleware
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const payload = {
      return_url: `${process.env.FRONTEND_URL}/payment-verify`,
      website_url: process.env.FRONTEND_URL,
      amount: Math.round(merch.price * 100) * quantity, // Ensure amount is an integer
      purchase_order_id: `TUNILA_${Date.now()}`,
      purchase_order_name: merch.name,
      customer_info: {
        name: user.name,
        email: user.email,
        phone: '9800000000' // Consider making this dynamic if you collect phone numbers
      }
    };

    const response = await axios.post(
      `${KHALTI_BASE_URL}/epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ 
      message: error.response?.data?.detail || error.message,
      error: error.toString()
    });
  }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.query;
    
    if (!pidx) {
      return res.status(400).json({ message: "Payment ID is required" });
    }
    
    const verification = await axios.post(
      `${KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (verification.data.status === 'Completed') {
      // Here you could update your database to mark the order as paid
      // Format could be: await Order.findOneAndUpdate({orderReference: verification.data.purchase_order_id}, {status: 'paid'})
      
      return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
    } else {
      // Payment failed or is pending
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      message: error.response?.data?.detail || "Payment verification failed",
      error: error.toString() 
    });
  }
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const merch = await Merchandise.findById(req.params.id);
    if (!merch) {
      return res.status(404).json({ message: "Merchandise not found" });
    }
    
    // Use req.userId from the auth middleware
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const wishlistIndex = user.wishlist.indexOf(merch._id);
    
    if (wishlistIndex === -1) {
      user.wishlist.push(merch._id);
      merch.wishlistedBy.push(user._id);
    } else {
      user.wishlist.splice(wishlistIndex, 1);
      merch.wishlistedBy.splice(merch.wishlistedBy.indexOf(user._id), 1);
    }

    await user.save();
    await merch.save();
    
    res.json({ 
      success: true,
      message: wishlistIndex === -1 ? "Added to wishlist" : "Removed from wishlist",
      inWishlist: wishlistIndex === -1
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllMerchandise = async (req, res) => {
    try {
      // First just get basic merch data
      const merch = await Merchandise.find().lean();
      
      // Then manually handle population with error checking
      const populatedMerch = [];
      for (const item of merch) {
        try {
          if (item.artist) {
            const artist = await User.findById(item.artist, 'name profilePicture');
            if (artist) {
              item.artist = artist;
            } else {
              item.artist = null; // Handle missing artist
            }
          }
          populatedMerch.push(item);
        } catch (err) {
          console.error(`Error populating artist for item ${item._id}:`, err);
          populatedMerch.push(item); // Still include the item
        }
      }
      
      res.json(populatedMerch);
    } catch (error) {
      console.error("Detailed error:", error);
      res.status(500).json({ message: error.message });
    }
  };

// Get single merchandise
export const getMerchandiseById = async (req, res) => {
  try {
    const merch = await Merchandise.findById(req.params.id)
      .populate({
        path: "artist",
        model: "User", // ✅ Explicitly define the model
        select: "name profilePicture",
      });

    if (!merch) {
      return res.status(404).json({ message: "Merchandise not found" });
    }
    
    res.json(merch);
  } catch (error) {
    console.error("Error fetching merchandise:", error);
    res.status(500).json({ message: error.message });
  }
};


export const getMerchandiseByArtist = async (req, res) => {
  try {
    // Simple find without populate to avoid circular references
    const merchItems = await Merchandise.find({ artist: req.params.userId }).lean();

    // Manually populate artist data if needed
    if (merchItems.length > 0) {
      const artistId = merchItems[0].artist;
      const artist = await User.findById(artistId, 'name profilePicture').lean();
      
      // Add artist info to each merchandise item
      const populatedMerch = merchItems.map(item => ({
        ...item,
        artist: artist || null
      }));
      
      res.status(200).json(populatedMerch);
    } else {
      res.status(200).json([]); // Return empty array if no merch items found
    }
  } catch (error) {
    console.error('Error fetching merchandise by artist:', error);
    res.status(500).json({ 
      message: 'Failed to fetch merchandise', 
      error: error.message 
    });
  }
};