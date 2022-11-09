// upload files
const router = require("express").Router();
const { cloudinary } = require("../utils/cloudinary");
const upload = require("../utils/multer");

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const fileStr = req.file.path;
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: "social_upload",
    });
    res.json({
      url: uploadResponse.secure_url,
      imageId: uploadResponse.public_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});

module.exports = router;
