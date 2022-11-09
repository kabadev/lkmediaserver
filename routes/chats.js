const router = require("express").Router();
const Chat = require("../models/Chat");
const Message = require("../models/Message");

//new conv

router.post("/", async (req, res) => {
  const newChat = new Chat({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const chat = await Chat.findOne({
      members: [req.body.receiverId, req.body.senderId],
    });
    if (chat) {
      return res.status(200).json({ status: 0, chatId: chat._id });
    } else {
      const savedChat = await newChat.save();
      res.status(200).json({ status: 1, chatId: savedChat._id });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get conv of a user

router.get("/:userId", async (req, res) => {
  try {
    const chat = await Chat.find({
      members: { $in: [req.params.userId] },
    })
      .populate("members")
      .exec();

    const messages = await Promise.all(
      chat.map((chat) => {
        const messages = Message.find({ chatId: chat._id })
          .sort({
            createdAt: -1,
          })
          .limit(1);
        return messages;
      })
    );

    res.status(200).json({ chats: chat, lastmsg: messages });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/currentchat/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.chatId });
    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
