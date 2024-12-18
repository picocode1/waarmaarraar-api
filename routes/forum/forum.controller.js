const express = require('express');
const router = express.Router();

const forumService = require('./forum.service');
const userFunction = new (require('../../functions/user.function'));
const helper = new (require('../../functions/helper.function.js'));

require('dotenv').config();
const MESSAGE = require('../../textDB/messages.text')[process.env.LANGUAGE];

const rateLimit = require('express-rate-limit');



// If anything is required with jwt/logged in user
const jwtCheck = require('../../middleware/jwt.middleware');
// router.post('/x', jwt, (req, res) => userService.x(req, res));

// Define rate limit middleware for forum-related routes
const forumRateLimit = rateLimit({
    windowMs: helper.toMinutes(5), // 5 minutes
    max: 30, // 30 requests per 5 minutes
    statusCode: 200,
    handler: function (req, res, next) {
        res.status(429).json({
			resetTime: Math.floor(new Date(req.rateLimit.resetTime).getTime() / 1000),
            message: MESSAGE.tooManyRequests,
            success: false
        });
    }
});

const sendMessageRateLimit = rateLimit({
    windowMs: helper.toMinutes(1), // for example, 1 minute
    max: 15, // for example, 15 requests per minute
    handler: function (req, res, next) {
        res.status(429).json({
			resetTime: Math.floor(new Date(req.rateLimit.resetTime).getTime() / 1000),
            message: MESSAGE.tooManyRequestsForSendingMessages,
            success: false
        });
    }
});

// Define rate limit middleware for forum-related routes
const forumRateLimitPosting = rateLimit({
    windowMs: helper.toMinutes(5), // 5 minutes
    max: 5, // 5 requests per 5 minutes
    statusCode: 200,
    handler: function (req, res, next) {
        res.status(429).json({
			resetTime: Math.floor(new Date(req.rateLimit.resetTime).getTime() / 1000),
            message: MESSAGE.tooManyRequests,
            success: false
        });
    }
});

// Apply forumRateLimit middleware to forum-related routes
router.post('/createPost', jwtCheck, forumRateLimitPosting, (req, res) => forumService.createPost(req, res));
router.post('/createArticle', jwtCheck, forumRateLimitPosting, (req, res) => forumService.createArticle(req, res));

router.post('/addComment', jwtCheck, forumRateLimitPosting, (req, res) => forumService.addComment(req, res));
router.post('/addReaction', jwtCheck, forumRateLimitPosting, (req, res) => forumService.addReaction(req, res));


router.get('/getCommentsByPost/:postId', jwtCheck, forumRateLimit, (req, res) => forumService.getCommentsByPost(req, res));
router.get('/getCommentsByUser/:userId', jwtCheck, forumRateLimit, (req, res) => forumService.getCommentsByUser(req, res));

router.get('/getPostById/:postId', jwtCheck, forumRateLimit, (req, res) => forumService.getPostById(req, res));
router.get('/getFollowingPosts/:amount', jwtCheck, forumRateLimit, (req, res) => forumService.getFollowingPosts(req, res));

router.get('/getArticles', forumRateLimit, (req, res) => forumService.getArticles(req, res));

router.post('/send', jwtCheck, sendMessageRateLimit, (req, res) => forumService.sendMessage(req, res));
router.get('/conversation/:userId/:startAmount?/:endAmount?', jwtCheck, sendMessageRateLimit, (req, res) => forumService.getConversation(req, res));
router.get('/chatContacts', jwtCheck, forumRateLimit, (req, res) => forumService.getChatContacts(req, res));

router.post('/follow/:username', jwtCheck, forumRateLimit, (req, res) => forumService.addFollower(req, res));

router.post('/readNotification/:notificationId', jwtCheck, forumRateLimit, (req, res) => forumService.readNotification(req, res));

router.get('/textDB/:property?', /* jwtCheck ,*/ forumRateLimit, (req, res) => forumService.textDB(req, res));

router.post('/addLike/:commentId', jwtCheck, forumRateLimit, (req, res) => forumService.addLike(req, res));

module.exports = router;