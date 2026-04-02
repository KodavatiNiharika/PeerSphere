const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const streamifier = require("streamifier");
require('dotenv').config();

const StudentModel = require("./models/student");
const VideoModel = require("./models/video");
const FileModel = require("./models/file");
const MessageModel = require("./models/message")
const cloudinary = require("./cloudinary"); //for streaming n transformations we have to install cloudinary SDK also
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));



// Register Route
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await StudentModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: `User with email ${email} already exists` });
    }
    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new StudentModel({
      username,
      email,
      password: hashedPassword, // ✅ store hashed password
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

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

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

  } catch (err) {
    res.status(500).json({ message: err.message });
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


// Routes
// Video Upload Route
app.get("/videos", authenticateToken, async (req, res) => {
  try {
    // Fetch all videos (without pagination)
    const videos = await VideoModel.find().exec();
    
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


app.post("/videoUpload", authenticateToken, upload.single("video"), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file uploaded" });
      }

      const { title, description, tag } = req.body;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video", //default is img
          folder: "peersphere/videos",
        },
        async (error, result) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ message: "Cloudinary upload failed" });
          }

          const newVideo = new VideoModel({
            title,
            description,
            tag,
            videoPath: result.secure_url,
            mail: req.user.email,
          });

          await newVideo.save();

          res.status(201).json({
            message: "Video uploaded successfully",
            video: newVideo,
          });
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);





// General File Upload Route
app.post("/fileUpload", authenticateToken, upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const { title, description, tag, name } = req.body;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "peersphere/files",
        },
        async (error, result) => {
          if (error) {
            console.error(error);
            return res.status(500).json({ message: "Cloudinary upload failed" });
          }
          // console.log("hhh");
          const newFile = new FileModel({
            username: name,
            title,
            description,
            tag,
            filePath: result.secure_url,
            mail: req.user.email,
          });

          await newFile.save();

          res.status(201).json({
            message: "File uploaded successfully",
            file: newFile,
          });
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);




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

// GET /api/chatContacts
app.get("/api/chatContacts", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all messages where this user is sender or receiver
    const messages = await MessageModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).populate("senderId", "username email")
      .populate("receiverId", "username email");

    // Extract unique contacts
    const contactsMap = {};
    messages.forEach((msg) => {
      const otherUser =
        msg.senderId._id.toString() === userId ? msg.receiverId : msg.senderId;
      contactsMap[otherUser.email] = otherUser; // ensure uniqueness
    });

    const contacts = Object.values(contactsMap);
    res.json({ contacts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// File downlaod
app.get("/file/:id", async (req, res) => { //acts as proxy, bcz some browsers wont allow downloading from  different domain 
  try {
    const file = await FileModel.findById(req.params.id);
    if (!file) return res.status(404).send("File not found");

    const axios = require("axios");
    const response = await axios.get(file.filePath, { responseType: "stream" }); //for large size files - stream

    res.setHeader("Content-Disposition", `attachment; filename="${file.title}"`);
    response.data.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});



const http = require("http");
const {Server} = require("socket.io")
const server = http.createServer(app);
const io = new Server(server, {
  path: "/socket.io",
  cors : {
    origin : "*",
    methods :["GET", "POST"],
  },
});

io.on("connection", (socket) =>{ // fires when a client successfully connects
console.log("User connected :", socket.id);
socket.on("join", (email) => {
  socket.join(email);
  console.log(`${email} joined their room`);
});
socket.on("sendMessage", async({senderEmail, receiverEmail, text}) => {
  try {
    const sender = await StudentModel.findOne({email : senderEmail});
    const receiver = await StudentModel.findOne({email : receiverEmail});
    if(!sender || !receiver) return ;
    const newMessage = new MessageModel({
      senderId : sender._id,
      receiverId : receiver._id,
      text,
    });
    await newMessage.save();
    io.to(receiverEmail).emit("receiveMessage", {
      senderEmail,
      receiverEmail,
      text,
      createdAt : newMessage.createdAt,
    });
    io.to(senderEmail).emit("receiveMessage", {
      senderEmail,
      receiverEmail,
      text,
      createdAt : newMessage.createdAt,
    });
  } catch(err) {
    console.error("Error saving message : ", err.message);
  }
});
socket.on("disconnect", () => {
  console.log("User disconnected : ", socket.id);
});
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
/* previously for http connections, we used app, but it wont let u know the reference, so u can't attach socket.IO
So we created server, so both the websocket events and HTTP requests(via Express) share common server.
*/

