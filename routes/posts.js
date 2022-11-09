const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/Users");
const Comment = require("../models/Comment");
const fs = require("fs");
const { cloudinary } = require("../utils/cloudinary");

//create a post
router.post("/", async (req, res) => {
  const user = await User.findById(req.body.userId);
  try {
    if (user) {
      const newPost = new Post({
        userId: req.body.userId,
        desc: req.body.desc,
        img: req.body.img,
        imgId: req.body.imgId,
        user: user._id,
      });
      const savedPost = await newPost.save();
      res.status(200).json(savedPost);
    } else {
      res.status(404).json("");
    }
  } catch (err) {
    res.status(500).json({ err: "Failed to post" });
  }
});

//update a post

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete a post

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      // user to delete file in the folder
      const images = post.imgId;
      images.map(async function (path) {
        await cloudinary.uploader.destroy(path);
      });
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//like / dislike a post

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//get a post

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts by id

router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    if (currentUser) {
      const userPosts = await Post.find({ userId: currentUser._id })
        .populate("user")
        .exec();

      const followingPosts = await Promise.all(
        currentUser.followings.map((friendId) => {
          return Post.find({ userId: friendId }).populate("user").exec();
        })
      );

      res.json(userPosts.concat(...followingPosts));
    } else {
      res.status(404).json({ erro: "User Not Found" });
    }
  } catch (err) {
    res.status(500).json({ erro: err });
  }
});

//get user's all posts with username
// 6329503eca11d6a662409127

router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    const posts = await Post.find({ userId: user._id }).populate("user").exec();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline most followed users posts by id

router.get("/", async (req, res) => {
  try {
    const allUsers = await User.find({}).limit(5);

    const mostFollowedUsers = allUsers.sort((a, b) =>
      a.followers.length < b.followers.length
        ? 1
        : b.followers.length < a.followers.length
        ? -1
        : 0
    );

    const mostFollowedPosts = await Promise.all(
      mostFollowedUsers.map((mostFollow) => {
        return Post.find({ userId: mostFollow._id }).populate("user").exec();
      })
    );
    res.json(allUsers.filter((task) => task.id !== "6329f10d23adda61fd81c049"));
  } catch (err) {
    res.status(500).json({ erro: err });
  }
});

module.exports = router;
