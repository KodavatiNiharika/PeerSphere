const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
});

module.exports = mongoose.model("Student", studentSchema);
