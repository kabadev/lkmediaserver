const router = require("express").Router();
const Story = require("../models/Story");
const Users = require("../models/Users");
const { cloudinary } = require("../utils/cloudinary");

//create a Story
router.post("/", async (req, res) => {
  const user = await Users.findById(req.body.user);
  const images = req.body.img;
  try {
    images.map((img) => {
      const newStory = new Story({
        user: user._id,
        img: img.img,
        imgId: img.imgId,
      });
      newStory.save();
    });

    res.status(200).json("Story Created Successfully");
  } catch (err) {
    res.status(500).json({ err: "Failed to Create " });
  }
});

router.get("/following/:userId", async (req, res) => {
  const currentUser = await Users.findById(req.params.userId);
  try {
    const userStory = await Story.find({ user: currentUser._id })
      .populate("user", "username profilePicture firstname lastname")
      .sort({
        createdAt: -1,
      })
      .limit(1)
      .exec();
    const followingStory = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Story.find({ user: friendId })
          .populate("user", "username profilePicture firstname lastname ")
          .sort({
            createdAt: -1,
          })
          .limit(1)
          .exec();
      })
    );
    const empty = [];
    res.status(200).json({
      current: userStory[0],
      following: empty.concat(...followingStory),
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:userId", async (req, res) => {
  const currentUser = await Users.findById(req.params.userId);
  try {
    const userStory = await Story.find({ user: currentUser._id })
      .populate("user", "username profilePicture firstname lastname")
      .sort({
        createdAt: 1,
      })
      .exec();

    res.status(200).json(userStory);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  try {
    const Stories = await Story.find({}).exec();

    Stories.map(async function (story) {
      var today = new Date().getDate();
      var tomorrow = story.createdAt.getDate() + 1;

      if (today >= tomorrow) {
        const images = story.imgId;
        await cloudinary.uploader.destroy(images);
        await story.deleteOne();
      }
    });

    res.status(200).json(Stories);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    // user to delete file in the folder
    const images = story.imgId;
    await cloudinary.uploader.destroy(images);
    await story.deleteOne();
    res.status(200).json("the post has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
