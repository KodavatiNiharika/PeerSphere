const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const StudentModel = require("./models/student");
const VideoModel = require("./models/video");
const FileModel = require("./models/file");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" })); // Replace with your frontend URL
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Register Route
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await StudentModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: `User with email ${email} already exists` });
    }

    const newUser = new StudentModel({
      username,
      email,
      password, // Store password as is (insecure)
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ message: "Registration successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await StudentModel.findOne({ email });
    if (user && user.password === password) {
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login successful",
        token,
        user: { username: user.username, email: user.email },
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
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

// Multer Configuration for Video Uploads
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads/videos";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
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

// Multer Configuration for General File Uploads
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads/files";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileUpload = multer({
  storage: fileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Routes
// Video Upload Route
app.get("/videos", authenticateToken, async (req, res) => {
  try {
    // Fetch all videos (without pagination)
    const videos = await VideoModel.find().exec();
    
    if (videos.length === 0) {
      return res.status(404).json({ message: "No videos found" });
    }
    // Add full video path to each video object
    const videoData = videos.map((video) => ({
      ...video._doc,
      videoPath: `${video.videoPath}`,
    }));

    res.status(200).json({
      videos: videoData,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

app.get("/files", authenticateToken, async (req, res) => {
  try {
    // Fetch all files (without pagination)
    const files = await FileModel.find().exec();
    
    if (files.length === 0) {
      return res.status(404).json({ message: "No files found" });
    }
    // Add full video path to each video object
    const fileData = files.map((file) => ({
      ...file._doc,
      filePath: `${file.filePath}`,
    }));

    res.status(200).json({
      files: fileData,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});


app.post("/videoUpload", authenticateToken, videoUpload.single("video"), async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const videoPath = `http://localhost:3001/uploads/videos/${req.file.filename}`;
    const newVideo = new VideoModel({
      title,
      videoPath,
      description,
      tag,
      mail: req.user.email,
    });
    await newVideo.save();
    res.status(201).json({ message: "Video uploaded successfully", video: newVideo });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// General File Upload Route
app.post("/fileUpload", authenticateToken, fileUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Destructure the incoming request body to capture the tag and description
    const { name, description, tag } = req.body;

    // Define the file path after upload
    const filePath = `http://localhost:3001/uploads/files/${req.file.filename}`;

    // Save the file upload record with the correct fields
    const newFile = new FileModel({
      username: name,  // username passed from the frontend
      name: name,  // file name passed from the frontend
      description,  // description passed from the frontend
      filePath,  // the file path generated
      mail: req.user.email,  // email of the authenticated user
      tag,  // tag from the frontend
    });

    // Save the new file document to MongoDB
    await newFile.save();

    res.status(201).json({
      message: "File uploaded successfully",
      file: newFile,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});




// Fetch Video Upload History
app.get("/api/uploadHistory", authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const uploadHistory = await VideoModel.find({ mail: email })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();
    const totalVideos = await VideoModel.countDocuments({ mail: email });
    res.status(200).json({
      uploadHistory: uploadHistory || [],
      totalPages: Math.ceil(totalVideos / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});
// Fetch File Upload History Route
app.get("/api/fileUploadHistory", authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;  // Use the authenticated user's email
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Fetch file upload history for the logged-in user from the FileModel
    const fileUploadHistory = await FileModel.find({ mail: email })  // Changed 'uploadedBy' to 'mail'
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    const totalFiles = await FileModel.countDocuments({ mail: email });  // Changed 'uploadedBy' to 'mail'

    res.status(200).json({
      fileUploadHistory: fileUploadHistory || [],
      totalPages: Math.ceil(totalFiles / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});




const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
