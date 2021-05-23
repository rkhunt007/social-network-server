const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const trimRequest = require('trim-request');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwtSecret = process.env.jwtSecret;

// @route   GET api/auth
// @desc    Auth route
// @access  Public
router.get('/',
    trimRequest.all, auth,
    async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json('Server Error');
    }
});

// @route   POST api/auth/login
// @desc    Login
// @access  Public
router.post('/login',
    trimRequest.all,
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(payload, jwtSecret, { expiresIn: 3600 }, (err, token) => {
                if (err) {
                    throw err;
                }
                res.json({ token });
            });
        } catch (error) {
            res.status(500).send('Server Error');
        }

    }
);

module.exports = router;
