const express = require('express');
const router = express.Router();

const forumService = require('./forum.service');
const userInfo = new (require('../../functions/user.function'));


// If anything is required with jwt/logged in user
const jwtCheck = require('../../middleware/jwt.middleware');
// router.post('/x', jwt, (req, res) => userService.x(req, res));

router.post('/createPost', jwtCheck, (req, res) => forumService.createPost(req, res));
router.post('/createArticle', jwtCheck, (req, res) => forumService.createArticle(req, res));

router.post('/addComment', jwtCheck, (req, res) => forumService.addComment(req, res));
router.post('/addReaction', jwtCheck, (req, res) => forumService.addReaction(req, res));

router.get('/getCommentsByPost/:postId', jwtCheck ,(req, res) => forumService.getCommentsByPost(req, res));
router.get('/getCommentsByUser/:userId', jwtCheck ,(req, res) => forumService.getCommentsByUser(req, res));

router.get('/getArticles', jwtCheck ,(req, res) => forumService.getArticles(req, res));

router.post('/send', jwtCheck, (req, res) => forumService.sendMessage(req, res));
router.get('/conversation/:userId/:amount?', jwtCheck, (req, res) => forumService.getConversation(req, res));
router.get('/chatContacts', jwtCheck, (req, res) => forumService.getChatContacts(req, res));
 
router.post('/follow/:username', jwtCheck, (req, res) => forumService.addFollower(req, res));
router.post('/following/:username', jwtCheck, (req, res) => forumService.addFollowing(req, res));


module.exports = router;