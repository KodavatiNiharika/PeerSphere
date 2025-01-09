const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  username: String,
  name: String,
  description: String,
  videoPath: String,
  mail: String,
  tag: String, // Added tag field
});

module.exports = mongoose.model("Video", videoSchema);
