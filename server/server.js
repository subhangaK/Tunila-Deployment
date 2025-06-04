import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import path from "path";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import playlistRouter from "./routes/playlistRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import merchandiseRoutes from "./routes/merchandiseRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

// Connect to the database
connectDB();

// Middleware
const allowedOrigins = ["https://tunila.netlify.app", "http://localhost:3000"];
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      console.log("Request Origin:", origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors()); // Handle preflight requests

// Serve static files from the "uploads" directory
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Endpoints
app.get("/", (req, res) => res.send("API Working"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRouter);
app.use("/api/admin", adminRouter);
app.use("/api/search", searchRoutes);
app.use("/api/merch", merchandiseRoutes);
app.use("/api/contact", contactRoutes);

// Start the server
app.listen(port, () => console.log(`Server started on PORT: ${port}`));
