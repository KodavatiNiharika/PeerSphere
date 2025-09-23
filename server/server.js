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
const MessageModel = require("./models/message")

const app = express();

// Middleware
const BASE_URL = process.env.BACKEND_URL || "http://localhost:3001";
app.use(express.json());
app.use(cors({ origin: "*" }));


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
  limits: { fileSize: 1000 * 1024 * 1024 },
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
    const videoPath = `${BASE_URL}/uploads/videos/${req.file.filename}`;
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
    const { name, title, description, tag } = req.body;

    // Define the file path after upload
    const filePath = `${BASE_URL}/uploads/files/${req.file.filename}`;

    // Save the file upload record with the correct fields
    const newFile = new FileModel({
      username: name,  // username passed from the frontend
      name: name,  // file name passed from the frontend
      title,
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





app.get('/api/users/findByEmail', async (req, res) => {
  const { email } = req.query;
  try {
    const user = await StudentModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});
 
app.post('/api/messages', async (req, res) => {
  try {
    const { senderEmail, receiverEmail, text } = req.body;

    if (!senderEmail || !receiverEmail || !text) {
      return res.status(400).json({ message: "senderEmail, receiverEmail and text are required" });
    }

    // Find sender
    const sender = await StudentModel.findOne({ email: senderEmail });
    if (!sender) {
      return res.status(404).json({ message: "Sender not found. Please login again." });
    }

    // Find receiver
    const receiver = await StudentModel.findOne({ email: receiverEmail });
    if (!receiver) {
      return res.status(404).json({ message: "Receiver email is not registered on this website." });
    }

    // Prevent sending message to self
    if (sender._id.toString() === receiver._id.toString()) {
      return res.status(400).json({ message: "You cannot send a message to yourself." });
    }

    // Save message
    const newMessage = new MessageModel({
      senderId: sender._id,
      receiverId: receiver._id,
      text,
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});




// GET /api/messages?senderEmail=...&receiverEmail=...
app.get('/api/messages', async (req, res) => {
  try {
    const { senderEmail, receiverEmail } = req.query;

    if (!senderEmail || !receiverEmail) {
      return res.status(400).json({ message: "senderEmail and receiverEmail are required" });
    }

    // Validate sender
    const sender = await StudentModel.findOne({ email: senderEmail });
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    // Validate receiver
    const receiver = await StudentModel.findOne({ email: receiverEmail });
    if (!receiver) {
      return res.status(404).json({ message: "Receiver email is not registered on this website" });
    }

    // Get messages safely
    const messages = await MessageModel.find({
      $or: [
        { senderId: sender._id, receiverId: receiver._id },
        { senderId: receiver._id, receiverId: sender._id }
      ]
    })
      .populate("senderId", "username email")
      .populate("receiverId", "username email")
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});




const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


