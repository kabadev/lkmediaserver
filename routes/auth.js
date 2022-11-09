const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/Users");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    const newUser = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    const oldusername = await User.findOne({ username: req.body.username });
    if (oldusername) {
      return res.status(400).json("Someone has already used this username");
    } else {
      const oldUser = await User.findOne({ email: req.body.email });
      if (oldUser) {
        return res
          .status(400)
          .json("Someone has already register with this email");
      } else {
        const user = await newUser.save();
        res.status(200).json("You have successfully register");
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
// generate token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, username: user.username }, "mySecretKey", {
    expiresIn: "5s",
  });
};

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(400).json("Email is Incorrect");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).json("Wrong Password");

    if (user && validPassword) {
      const accessToken = generateAccessToken(user);
      const { password, updatedAt, ...other } = user._doc;
      res.status(200).json({
        auth: true,
        accessToken: accessToken,
        coverPicture: user.coverPicture,
        profilePicture: user.profilePicture,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        followers: user.followers,
        followings: user.followings,
        isAdmin: user.isAdmin,
        id: user._id,
        city: user.city,
        country: user.country,
        bio: user.bio,
      });
    } else {
      res.status(400).json("Username or password incorrect!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
