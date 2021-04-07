const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const responseSchema = new Schema(
  {
    path: {
      type: String,
      required: true,
    },
    questionPaperID: {
      type: mongoose.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    belongsToRoom: {
      type: mongoose.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    submittedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Response", responseSchema);
