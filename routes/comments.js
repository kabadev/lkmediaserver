const router = require("express").Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/Users");
const crypto = require("crypto");

//create a post
router.post("/", async (req, res) => {
  const user = await User.findById(req.body.writer);
  const id = crypto.randomBytes(12).toString("hex");
  try {
    const data = {
      writer: user,
      content: req.body.content,
      _id: id,
      responseTo: req.body.responseTo,
    };
    // "responseTo" in req.body && data.responseTo = req.body.responseTo;

    const comment = new Comment(data);
    const parent = await Post.findById(req.body.postId);
    const parentd = await parent.updateOne({
      $push: { comments: data },
    });

    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ err: "Failed to post" });
  }
});

// router.get("/:id", async (req, res) => {
//   try {
//     const post = await Comment.find(req.params.postId);
//     res.status(200).json(post);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

module.exports = router;
