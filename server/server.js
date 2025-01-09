const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const StudentModel = require("./models/student");
const VideoModel = require("./models/video");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" })); // Replace with your frontend URL
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  const tokenWithoutBearer = token.split(" ")[1]; // Extract token from 'Bearer <token>'

  if (!tokenWithoutBearer) {
    return res.status(403).json({ message: "Invalid token format" });
  }

  jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = decoded;
    next();
  });
};

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads/videos";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mkv|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Invalid file type. Only video files are allowed."));
  },
});

app.post("/videoUpload", upload.single("video"), async (req, res) => {
  const { username, description, mail, tag } = req.body; // Include tag

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const videoPath = `http://localhost:3001/uploads/videos/${req.file.filename}`;

  try {
    const newVideo = new VideoModel({
      username,
      videoPath,
      mail,
      description,
      tag, // Save tag in the database
    });

    await newVideo.save();
    res.status(201).json({ message: "Video uploaded successfully", video: newVideo });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});


app.get("/api/uploadHistory", authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    const { page = 1, limit = 10 } = req.query; // Pagination query parameters
    const skip = (page - 1) * limit;

    const uploadHistory = await VideoModel.find({ mail: email })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const totalVideos = await VideoModel.countDocuments({ mail: email });

    res.status(200).json({
      uploadHistory: Array.isArray(uploadHistory) ? uploadHistory : [], // Ensure array format
      totalPages: Math.ceil(totalVideos / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});


// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
