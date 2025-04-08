import mongoose from "mongoose";
import Merchandise from "../models/merchandiseModel.js";
import User from "../models/userModel.js";
import Transaction from "../models/transactionModel.js";
import axios from "axios";
import transporter from "../config/nodemailer.js";
import {
  PURCHASE_CONFIRMATION_TEMPLATE,
  ARTIST_SALE_TEMPLATE,
} from "../config/emailTemplates.js";

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE_URL = "https://a.khalti.com/api/v2";

// Create new merchandise
export const createMerchandise = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || !user.canSellMerch) {
      return res.status(403).json({
        message: "Complete artist verification to sell items",
      });
    }

    const { name, description, price, type, stock } = req.body;

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    const images = req.files.map((file) => `/uploads/merch/${file.filename}`);

    const merch = await Merchandise.create({
      name,
      description,
      price,
      type,
      stock,
      images,
      artist: user._id,
    });

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

    if (!merchId || !quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const merch = await Merchandise.findById(merchId);
    if (!merch) {
      return res.status(404).json({ message: "Merchandise not found" });
    }

    if (merch.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const payload = {
      return_url: `${process.env.FRONTEND_URL}/payment-verify`,
      website_url: process.env.FRONTEND_URL,
      amount: Math.round(merch.price * 100) * quantity,
      purchase_order_id: `TUNILA_${Date.now()}`,
      purchase_order_name: merch.name,
      customer_info: {
        name: user.name,
        email: user.email,
        phone: "9800000000",
      },
    };

    const response = await axios.post(
      `${KHALTI_BASE_URL}/epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Create a transaction record instead of deducting stock
    await Transaction.create({
      merch: merchId,
      quantity,
      price: merch.price, // Add this line
      buyer: req.userId,
      artist: merch.artist,
      pidx: response.data.pidx,
      status: "initiated",
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: error.response?.data?.detail || error.message,
      error: error.toString(),
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
          "Content-Type": "application/json",
        },
      }
    );

    if (verification.data.status === "Completed") {
      const transaction = await Transaction.findOne({ pidx })
        .populate("merch")
        .populate("buyer")
        .populate("artist");

      if (!transaction) throw new Error("Transaction not found");

      if (transaction.status === "completed") {
        return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
      }

      // Deduct stock only after successful payment verification
      if (transaction.merch.stock < transaction.quantity) {
        transaction.status = "failed";
        await transaction.save();
        throw new Error("Insufficient stock");
      }

      transaction.merch.stock -= transaction.quantity;
      await transaction.merch.save();

      // Update transaction status
      transaction.status = "completed";
      await transaction.save();

      // Send emails to buyer and artist
      const buyerMailOptions = {
        from: process.env.SENDER_EMAIL,
        to: transaction.buyer.email,
        subject: "Purchase Confirmation",
        html: PURCHASE_CONFIRMATION_TEMPLATE.replace(
          "{{itemName}}",
          transaction.merch.name
        )
          .replace("{{quantity}}", transaction.quantity)
          .replace(
            "{{totalPrice}}",
            transaction.merch.price * transaction.quantity
          ),
      };

      const artistMailOptions = {
        from: process.env.SENDER_EMAIL,
        to: transaction.artist.email,
        subject: "New Sale Notification",
        html: ARTIST_SALE_TEMPLATE.replace(
          "{{itemName}}",
          transaction.merch.name
        )
          .replace("{{quantity}}", transaction.quantity)
          .replace("{{buyerName}}", transaction.buyer.name)
          .replace("{{remainingStock}}", transaction.merch.stock),
      };

      await transporter.sendMail(buyerMailOptions);
      await transporter.sendMail(artistMailOptions);

      return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      message: error.response?.data?.detail || "Payment verification failed",
      error: error.toString(),
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
      message:
        wishlistIndex === -1 ? "Added to wishlist" : "Removed from wishlist",
      inWishlist: wishlistIndex === -1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all merchandise (only items with stock > 0)
export const getAllMerchandise = async (req, res) => {
  try {
    const merch = await Merchandise.find({ stock: { $gt: 0 } }).lean();

    const populatedMerch = [];
    for (const item of merch) {
      try {
        if (item.artist) {
          const artist = await User.findById(
            item.artist,
            "name profilePicture"
          );
          if (artist) {
            item.artist = artist;
          } else {
            item.artist = null;
          }
        }
        populatedMerch.push(item);
      } catch (err) {
        console.error(`Error populating artist for item ${item._id}:`, err);
        populatedMerch.push(item);
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
    const merch = await Merchandise.findById(req.params.id).populate({
      path: "artist",
      model: "User",
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

// Get merchandise by artist
export const getMerchandiseByArtist = async (req, res) => {
  try {
    const merchItems = await Merchandise.find({
      artist: req.params.userId,
      stock: { $gt: 0 }, // Only include items with stock > 0
    }).lean();

    if (merchItems.length > 0) {
      const artistId = merchItems[0].artist;
      const artist = await User.findById(
        artistId,
        "name profilePicture"
      ).lean();

      const populatedMerch = merchItems.map((item) => ({
        ...item,
        artist: artist || null,
      }));

      res.status(200).json(populatedMerch);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    console.error("Error fetching merchandise by artist:", error);
    res.status(500).json({
      message: "Failed to fetch merchandise",
      error: error.message,
    });
  }
};

export const getWishlistedMerchandise = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: "wishlist",
      model: "Merchandise",
      populate: {
        path: "artist",
        model: "User",
        select: "name profilePicture",
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter out items with stock > 0
    const wishlistedItems = user.wishlist.filter((item) => item.stock > 0);

    res.status(200).json(wishlistedItems);
  } catch (error) {
    console.error("Error fetching wishlisted items:", error);
    res.status(500).json({ message: "Failed to fetch wishlisted items" });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      buyer: req.userId,
      status: "completed",
    })
      .populate({
        path: "merch",
        select: "name images artist",
        populate: {
          path: "artist",
          select: "name profilePicture",
        },
      })
      .sort({ createdAt: -1 });

    const formattedTransactions = transactions.map((transaction) => ({
      _id: transaction._id,
      merch: {
        _id: transaction.merch._id, // Make sure this is included
        name: transaction.merch.name,
        image: transaction.merch.images[0],
        artist: transaction.merch.artist.name,
        artistProfile: transaction.merch.artist.profilePicture,
      },
      quantity: transaction.quantity,
      price: transaction.price, // Use the stored price
      total: transaction.price * transaction.quantity,
      purchaseDate: transaction.createdAt,
    }));

    res.status(200).json(formattedTransactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order history" });
  }
};
