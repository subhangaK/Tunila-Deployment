import multer from "multer";
import path from "path";

// Set storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "song") {
      cb(null, "./uploads/songs"); // Save songs in the 'songs' directory
    } else if (file.fieldname === "cover") {
      cb(null, "./uploads/covers"); // Save cover images in the 'covers' directory
    }
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    const fileName = Date.now() + extname;
    cb(null, fileName); // Ensure unique file names with timestamp
  },
});

// File filter function to allow only valid file types
const fileFilter = (req, file, cb) => {
  console.log("File received:", file.originalname); // Log file name
  console.log("MIME type:", file.mimetype); // Log MIME type
  console.log("Extension:", path.extname(file.originalname)); // Log file extension

  if (file.fieldname === "song") {
    // Allow only .mp3 and .wav files for songs
    const fileTypes = /mp3|wav/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    // Relax MIME type check to also accept "audio/mpeg" for .mp3
    if (extname || mimetype === "audio/mpeg") {
      return cb(null, true); // Valid file type
    } else {
      return cb(new Error("Invalid file type for song"), false); // Invalid file type
    }
  } else if (file.fieldname === "cover") {
    // Allow image files (jpg, png, jpeg) for cover images
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true); // Valid file type
    } else {
      return cb(new Error("Invalid file type for cover image"), false); // Invalid file type
    }
  }
};

// Initialize multer with the storage and file filter
const upload = multer({
  storage: storage,
  limits: { fileSize: 50000000 }, // Limit file size to 50MB (optional)
  fileFilter: fileFilter,
});

export default upload;
