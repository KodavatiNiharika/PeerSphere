const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  username: String,
  name: String,
  description: String,
  filePath: String,
  mail: String,
  tag: String, // Added tag field
});

module.exports = mongoose.model("File", fileSchema);
