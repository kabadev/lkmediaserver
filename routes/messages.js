const router = require("express").Router();
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/Users");
const fs = require("fs");
const { cloudinary } = require("../utils/cloudinary");
//add

router.post("/", async (req, res) => {
  const user = await User.findById(req.body.sender);
  const chat = await Chat.findById(req.body.chatId);
  const newMessage = new Message({
    chatId: req.body.chatId,
    sender: req.body.sender,
    text: req.body.text,
    img: req.body.img,
    imgId: req.body.imgId,
    user: user._id,
    see: chat.members,
  });
  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

router.get("/:chatId", async (req, res) => {
  try {
    const messages = await Message.find({
      chatId: req.params.chatId,
    }).populate("user");
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id/deleteOne", async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    const user = await User.findById(req.body.userId);
    if (message.see.includes(req.body.userId)) {
      await message.updateOne({ $pull: { see: user._id } });
      res.status(200).json(message);
    } else {
      res.status(400).json("already removed");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete for all

router.delete("/:id/forAll", async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    // if (message.sender === req.body.userId) {

    // user to delete file in the folder
    const images = message.imgId;
    images.map(async function (path) {
      await cloudinary.uploader.destroy(path);
    });
    await message.deleteOne();
    res.status(200).json("the Message has been deleted");
    // } else {
    //   res.status(403).json("you can delete only your Message");
    // }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
