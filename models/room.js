const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roomName: {
    type: String,
    required: true,
  },
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  questionPapers: [
    {
      type: Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
});

module.exports = new mongoose.model("Room", roomSchema);
