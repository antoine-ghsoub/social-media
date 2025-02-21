import express from "express";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import storyRoutes from "./routes/stories.js";
import relationshipRoutes from "./routes/relationships.js";

const app = express();

// Middlewares

// Enable CORS with credentials allowed and set the correct origin
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // Replace with your frontend's origin if different
    credentials: true,
  })
);

// Parse cookies and JSON bodies before handling routes
app.use(cookieParser());
app.use(express.json());

// Multer storage configuration (ensure that the destination path is correct for your project)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage: storage });

// File upload route
app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

// Route Handlers
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/relationships", relationshipRoutes);
app.use("/api/stories", storyRoutes);

app.listen(8800, () => {
  console.log("API working on port 8800!");
});
