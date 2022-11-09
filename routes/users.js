const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/Users");
const fs = require("fs");
const { cloudinary } = require("../utils/cloudinary");

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      const updateduser = await User.findById(user._id);
      const { password, updatedAt, ...other } = updateduser._doc;
      try {
        if (req.body.coverPicture) {
          await cloudinary.uploader.destroy(user.coverId);
        } else if (req.body.profilePicture) {
          await cloudinary.uploader.destroy(user.profileId);
        } else {
        }
      } catch (err) {
        res.status(403).json({ erro: err });
      }
      res.status(200).json(other);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only your account!");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

router.get("/followers/:userId", async (req, res) => {
  const currentUser = await User.findById(req.params.userId);
  try {
    const followers = await Promise.all(
      currentUser.followers.map((id) => {
        return User.find({ _id: id });
      })
    );
    let empty = [];
    let userfollower = empty.concat(...followers);
    res.status(200).json(userfollower);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/followings/:userId", async (req, res) => {
  const currentUser = await User.findById(req.params.userId);
  try {
    const followings = await Promise.all(
      currentUser.followings.map((id) => {
        return User.find({ _id: id });
      })
    );
    let empty = [];
    let userfollowings = empty.concat(...followings);
    res.status(200).json(userfollowings);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/mostfollower/", async (req, res) => {
  try {
    const allUsers = await User.find({}).limit(5);

    const mostFollowedUsers = allUsers.sort((a, b) =>
      a.followers.length < b.followers.length
        ? 1
        : b.followers.length < a.followers.length
        ? -1
        : 0
    );

    res.status(200).json(mostFollowedUsers);
  } catch (err) {
    res.status(500).json(err);
  }
});

// router.get("/usersall/", async (req, res) => {
//   try {
//     const allUsers = await User.find({});

//     res.status(200).json(mostFollowedUsers);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

router.post("/Search", async (req, res) => {
  let search = req.body.terms;

  // Create expression
  var re = new RegExp(search, "i");
  let find = {};
  if (search != undefined && search != "") {
    find = {
      $or: [
        { firstname: { $regex: re } },
        { lastname: { $regex: re } },
        { username: { $regex: re } },
      ],
    };
  }
  let dataSearched = await User.find(find)
    .select("firstname lastname username profilePicture")
    .limit(10);
  res.json(dataSearched);
});

module.exports = router;
