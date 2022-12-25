const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const trimRequest = require("trim-request");
const User = require("../../models/User");
const UserProfile = require("../../models/UserProfile");
const { sendRegistrationEmailMessage } = require("../../middleware/sendRegistrationEmail");
const jwtSecret = process.env.jwtSecret;
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/profile/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("File not supported"), false);
  }
};

const auth = require("../../middleware/auth");
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024,
  },
  fileFilter: fileFilter,
});

/**
 * @route POST api/profile/image
 * @desc Update profile image
 * @access Private
 */
router.post("/image", upload.single("profilePic"), trimRequest.all, auth, async (req, res) => {
  try {
    console.log("/image");
    // check if email exists
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({ errors: [{ msg: "User Not Found" }] });
    }

    const result = await user.updateOne({
      image: req.file.path,
    });
    user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

/**
 * @route POST api/profile
 * @desc Update profile
 * @access Private
 */
router.post(
  "/",
  [
    auth,
    [
      check("friends", "friends is Required").not().isEmpty(),
      check("bio", "bio is Required").not().isEmpty(),
      check("profession", "profession is Required").not().isEmpty(),
      check("city", "city is Required").not().isEmpty(),
      check("relationship_status", "relationship status is Required").not().isEmpty(),
    ],
  ],
  trimRequest.all,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { friends, bio, profession, city, relationship_status } = req.body;

    // Build Profile Object
    const profileFields = {};
    profileFields.user = req.user.id;
    profileFields.friends = friends;
    profileFields.bio = bio;
    profileFields.city = city;
    profileFields.profession = profession;
    profileFields.relationship_status = relationship_status;

    try {
      let user = await User.findById(req.user.id);
      if (!user) {
        return res.status(400).json({ errors: [{ msg: "User Not Found" }] });
      } else {
        let profile = await UserProfile.findOne({ user: req.user.id });
        console.log({ profile });
        if (profile) {
          profile = await UserProfile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          );
          return res.json(profile);
        }
        profile = new UserProfile(profileFields);
        await profile.save();
        res.json(profile);
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/profile/me
// @desc    get current user's profile
// @access  private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "email", "avatar", "image"]);

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(profile);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
