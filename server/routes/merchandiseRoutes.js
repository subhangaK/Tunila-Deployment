// routes/merchandiseRoutes.js
import express from 'express';
import { 
  createMerchandise,
  getAllMerchandise,
  getMerchandiseById,
  addToWishlist,
  initiatePayment,
  verifyPayment,
  getMerchandiseByArtist
} from '../controllers/merchandiseController.js';
import userAuth from '../middleware/userAuth.js';
import multer from 'multer';

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
router.get('/', getAllMerchandise);
router.get('/:id', getMerchandiseById);
router.post('/:id/wishlist', userAuth, addToWishlist);
router.post('/payment/initiate', userAuth, initiatePayment);
router.get('/payment/verify', verifyPayment);
router.get('/artist/:userId', getMerchandiseByArtist);


export default router;