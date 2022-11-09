const router = require("express").Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/Users");

//post a Comment
router.post("/", (req, res) => {
  const comment = new Comment(req.body);

  comment.save((err, comment) => {
    if (err) return res.json({ success: false, err });
    const post = Post.findById(comment.postId);
    post.comments.push(comment._id);

    Comment.find({ _id: comment._id })
      .populate("writer")
      .exec((err, result) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({ success: true, result });
      });
  });
});

module.exports = router;
