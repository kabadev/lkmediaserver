const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var StorySchema = mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    img: {
      type: String,
      default: "",
    },
    imgId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", StorySchema);
