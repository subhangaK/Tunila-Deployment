import express from "express";
import {
  createMerchandise,
  getAllMerchandise,
  getMerchandiseById,
  addToWishlist,
  initiatePayment,
  verifyPayment,
  getMerchandiseByArtist,
  getWishlistedMerchandise,
  getOrderHistory,
  updateMerchandise,
  deleteMerchandise,
  getAllMerchandiseByArtist,
} from "../controllers/merchandiseController.js";
import userAuth from "../middleware/userAuth.js";
import multer from "multer";
import Transaction from "../models/transactionModel.js";

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/merch/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post("/", userAuth, upload.array("images", 5), createMerchandise);
router.get("/", getAllMerchandise);
router.get("/:id", getMerchandiseById);
router.post("/:id/wishlist", userAuth, addToWishlist);
router.put("/:id", userAuth, upload.array("images", 5), updateMerchandise);
router.delete("/:id", userAuth, deleteMerchandise);
router.post("/payment/initiate", userAuth, initiatePayment);
router.get("/payment/verify", verifyPayment);
router.get("/artist/:userId", getMerchandiseByArtist);
router.get("/artist/:userId/all", userAuth, getAllMerchandiseByArtist);
router.get("/wishlist/my-items", userAuth, getWishlistedMerchandise);
router.get("/orders/history", userAuth, getOrderHistory);

export default router;
