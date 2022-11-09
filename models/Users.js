const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      min: 3,
      max: 20,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    firstname: {
      type: String,
      min: 3,
    },
    lastname: {
      type: String,
      min: 3,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    profileId: {
      type: String,
      default: "",
    },
    coverPicture: {
      type: String,
      default: "",
    },
    coverId: {
      type: String,
      default: "",
    },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      max: 200,
      default: "",
    },
    city: {
      type: String,
      max: 50,
      default: "",
    },
    country: {
      type: String,
      max: 50,
      default: "",
    },
    workAt: {
      type: String,
      max: 50,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
