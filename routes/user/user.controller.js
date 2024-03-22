const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// console.log("user controller js");


// Import the authenticateUser middleware

// If anything is required with jwt/logged in user
const jwtCheck = require('../../middleware/jwt.middleware');
// router.post('/x', jwt, (req, res) => userService.x(req, res));



router.post('/login', (req, res) => userService.loginUser(req, res));
router.post('/register', (req, res) => userService.registerUser(req, res));
router.get('/logout', jwtCheck, (req, res) => userService.logoutUser(req, res));


router.post('/addFriend/:username', jwtCheck, (req, res) => userService.addFriend(req, res));
router.get('/getUser/:username', jwtCheck, (req, res) => userService.getUser(req, res));
router.get('/getNotifications', jwtCheck, (req, res) => userService.getNotifications(req, res));

router.post('/sendMessage/:username', jwtCheck, (req, res) => userService.sendMessage(req, res));

module.exports = router;