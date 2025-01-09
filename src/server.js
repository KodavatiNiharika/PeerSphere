const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 3001;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// Middleware to serve static files (uploaded videos)
app.use("/videos", express.static(path.join(__dirname, "uploads")));

// MongoDB Atlas connection string
const dbURI = "mongodb+srv://kodavatiniharika:niharika@cluster0.mongodb.net/userDB?retryWrites=true&w=majority";

// Connect to MongoDB Atlas
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

// Define User Schema
const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    required: true,
    enum: ["student", "mentor"],
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /.+\@.+\..+/,
  },
});

// Pre-save hook to hash passwords before saving to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if the password is not modified
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Create a model based on the schema
const User = mongoose.model("User", userSchema);

// Video Schema
const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  video: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const Video = mongoose.model("Video", videoSchema);

// Set up multer storage for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage: storage });

// Registration route
app.post("/register", async (req, res) => {
  const { userType, username, password, email } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      const conflictField = existingUser.username === username ? "Username" : "Email";
      return res.status(400).json({ message: `${conflictField} already exists` });
    }

    const newUser = new User({ userType, username, password, email });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", userType: user.userType });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Video upload route
app.post("/uploadVideo", upload.single("video"), async (req, res) => {
  const { videoId, title, description } = req.body;
  const videoFile = req.file;

  // Ensure all necessary data is provided
  if (!videoId || !title || !description || !videoFile) {
    return res.status(400).json({ message: "Please provide all video details and select a file" });
  }

  try {
    // Create new video record
    const newVideo = new Video({
      videoId,
      title,
      description,
      video: videoFile.filename, // Store the filename
    });

    // Save the new video record to the database
    await newVideo.save();

    // Return success response
    res.status(201).json({ message: "Video uploaded successfully", video: newVideo });
  } catch (err) {
    console.error("Error uploading video:", err);
    res.status(500).json({ message: "Error uploading video", error: err.message });
  }
});

// Check if videoId exists
app.get("/videoExists/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findOne({ videoId });
    if (video) {
      return res.json({ exists: true });
    }
    res.json({ exists: false });
  } catch (err) {
    console.error("Error checking video ID:", err);
    res.status(500).json({ message: "Error checking video ID" });
  }
});

// Get all videos (for students)
app.get("/videos", async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json(videos);
  } catch (err) {
    console.error("Error fetching videos:", err);
    res.status(500).json({ message: "Error fetching videos" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
