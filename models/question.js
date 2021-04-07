const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const questionSchema = new Schema({
  path: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  belongsToRoom: {
    type: mongoose.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = new mongoose.model("Question", questionSchema);
