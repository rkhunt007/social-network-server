const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const trimRequest = require("trim-request");
const User = require("../../models/User");
const { sendRegistrationEmailMessage } = require("../../middleware/sendRegistrationEmail");
const auth = require("../../middleware/auth");
const jwtSecret = process.env.jwtSecret;

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post(
  "/register",
  trimRequest.all,
  [
    check("name", "Name is Required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    // get the errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // check if email exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: "User Already Exists" }] });
      }

      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      user = new User({ name, email, password, avatar });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password.toString(), salt);
      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      if (process.env.NODE_ENV === "production") {
        sendRegistrationEmailMessage(user);
      }

      jwt.sign(payload, jwtSecret, { expiresIn: 3600 }, (err, token) => {
        if (err) {
          throw err;
        }
        res.json({ token });
      });
    } catch (error) {
      res.status(500).send("Server Error");
    }
  }
);

/**
 * @route GET api/users
 * @desc Get all users
 * @access Private
 */
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } });
    res.json(users);
  } catch (error) {
    res.status(500).send({
      err: error,
    });
  }
});

module.exports = router;
