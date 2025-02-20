import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import path from "path"; // Import path for resolving directory
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import songRoutes from "./routes/songRoutes.js"; // Import song routes
import playlistRouter from "./routes/playlistRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import merchandiseRoutes from "./routes/merchandiseRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

// Connect to the database
connectDB();

// Middleware
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"]; // Frontend allowed origins
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Serve static files from the "uploads" directory
const __dirname = path.resolve(); // Resolve the root directory
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Static file serving

// API Endpoints
app.get("/", (req, res) => res.send("API Working"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/songs", songRoutes); // Use songRoutes for /api/songs endpoint
app.use("/api/playlists", playlistRouter);
app.use("/api/admin", adminRouter);
app.use("/api/search", searchRoutes);
app.use("/api/merch", merchandiseRoutes);

// Start the server
app.listen(port, () => console.log(`Server started on PORT: ${port}`));
