const express = require('express');
const router = express.Router();
const userService = require('./user.service');

const rateLimit = require('express-rate-limit');

let toMinutes = n => n * 60 * 1000


// Define rate limit middleware for /user/* routes with a rate limit of 3 requests per 5 minutes
const userRateLimit = rateLimit({
    windowMs: toMinutes(1),
    max: 10,
    statusCode: 200,
    handler: function (req, res, next) {
        res.status(429).json({
            message: "Too many requests, please try again later.",
            success: false
        });
    }
});

// Define rate limit middleware for login and register routes with a rate limit of 10 requests per minute
const loginRegisterRateLimit = rateLimit({
    windowMs: toMinutes(1), // 1 minute
    max: 5, // 10 requests per minute
    handler: function (req, res, next) {
        res.status(429).json({
            message: "Too many requests for login or register, please try again later.",
            success: false
        });
    }
});





// If anything is required with jwt/logged in user
const jwtCheck = require('../../middleware/jwt.middleware');
// router.post('/x', jwt, (req, res) => userService.x(req, res));


router.post('/login', loginRegisterRateLimit, (req, res) => userService.loginUser(req, res));
router.post('/register', loginRegisterRateLimit, (req, res) => userService.registerUser(req, res));


router.get('/logout', jwtCheck, (req, res) => userService.logoutUser(req, res));

// Update user info
router.put('/updateUser', jwtCheck, userRateLimit, (req, res) => userService.updateUser(req, res));

// Apply userRateLimit middleware to these routes
router.post('/addFriend/:username', jwtCheck, userRateLimit, (req, res) => userService.addFriend(req, res));
router.get('/getUser/:username', jwtCheck, userRateLimit, (req, res) => userService.getUser(req, res));
router.get('/getNotifications', jwtCheck, userRateLimit, (req, res) => userService.getNotifications(req, res));

// Apply sendMessageRateLimit middleware to these routes
// router.post('/sendMessage/:username', jwtCheck, sendMessageRateLimit, (req, res) => userService.sendMessage(req, res));
// router.get('/getMessages/:username', jwtCheck, userRateLimit, (req, res) => userService.getMessages(req, res));



module.exports = router;