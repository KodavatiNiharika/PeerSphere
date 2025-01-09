const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
});

module.exports = mongoose.model("Student", studentSchema);
