const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const trimRequest = require('trim-request');
const User = require('../../models/User');
const { sendRegistrationEmailMessage } = require('../../middleware/sendRegistrationEmail')
const jwtSecret = process.env.jwtSecret;
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/profile/');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        cb(new Error('File not supported'), false);
    }
}

const auth = require('../../middleware/auth');
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024
    },
    fileFilter: fileFilter
})

/**
 * @route POST api/profile
 * @desc Update profile
 * @access Private
 */
router.post('/',
    upload.single('profilePic'),
    trimRequest.all,
    auth,
    async (req, res) => {

        const { name, email, password } = req.body;

        try {
            // check if email exists
            let user = await User.findById(req.user.id);
            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'User Not Found' }] });
            }

            const result = await user.updateOne({
                image: req.file.path
            })

            res.json('Done');

        } catch (error) {
            console.log(error)
            res.status(500).send('Server Error');
        }

    }
);

/**
 * @route GET api/users
 * @desc Get all users
 * @access Public
 */
router.get('/', async (req, res) => {

    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        // console.log(error)
        res.status(500).send({
            err: error
        });
    }

});

module.exports = router;
