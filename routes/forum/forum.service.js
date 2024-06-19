const mongoose = require('mongoose');

const User = require('../user/user.model.js');

const Post = require('./models/post.model.js');
const Comment = require('./models/comment.model.js');
const Reaction = require('./models/reaction.model.js');

const Role = require('../../models/roles.model.js');

const userFunction = new (require('../../functions/user.function.js'));
const helper = new (require('../../functions/helper.function.js'));

const Messages = require('../../models/message.model.js');

const Connection = require('../../models/connections.model.js')

require('dotenv').config();
const MESSAGE = require('../../textDB/messages.text')[process.env.LANGUAGE];
const _textDB = require('../../textDB/messages.text');


const emoji = require('node-emoji');


const createPost = async (req, res) => {
    try {
		// If authentication succeeds, continue with createPost logic
        const UD = req.userData; // Assuming req.user is properly set in middleware

		const userData = await User.findOne({ username: UD.username }).populate('role');

        const { title, content, category, meta_tags, image, article } = req.body;
        
		if (!content) {
			res.status(400).json({ message: MESSAGE.missingContent, success: false});
			return;
		}
		if (!title) {
			res.status(400).json({ message: MESSAGE.missingTitle, success: false});
			return;
		}

		const hasPermission = helper.hasPermission(userData.role.name);

		// Check if article is true and if user has permission
		const isArticle = hasPermission && article;
		
		// Generate new ObjectId for the post
		const newPost = new Post({
			_id: new mongoose.Types.ObjectId(),
			user: userData._id,
			username: UD.username,
			title,
			content,
			category: category ?? "",
			meta_tags: meta_tags ?? [],
			created_at: new Date(),
			is_article: isArticle,
			image
		});
        

        // Save the post to the database
        const savedPost = await newPost.save();
		console.log(isArticle);

		if (isArticle) {
			// Increment the article_count field in the user document
			userFunction.incrementField(UD.username, "articles_count", 1);
		} else {
			userFunction.incrementField(UD.username, "forum_posts_count", 1);
		}

		
		
		// lastForumPost
		userFunction.updateLastPost(UD.username);

        // Respond with success message
        res.status(200).json({ message: MESSAGE.postCreatedSuccessfully, 
			// Remove later, only for testing
			post: savedPost,
			success: true
		});
    } catch (error) {
        res.status(500).json({ message: MESSAGE.couldNotCreatePost(error), success: false  });
    }
};


const addComment = async (req, res) => {
    try {
		// If authentication succeeds, continue with addComment logic
        const UD = req.userData; // Assuming req.user is properly set in middleware
 
        const userData = await User.findOne({ username: UD.username });

        const { content, post_id } = req.body;
        
		if (!content) {
			res.status(400).json({ message: MESSAGE.missingContent, success: false});
			return;
		}

		if (!post_id) {
			res.status(400).json({ message: MESSAGE.missingPostId, success: false});
			return;
		}


        // Generate new ObjectId for the post
        const newComment = new Comment({
            _id: new mongoose.Types.ObjectId(),
			user: userData._id,
			
			content: emoji.unemojify(content),
			post_id,
			created_at: new Date(),
        });
        

        // Save the comment to the database
        const savedComment = await newComment.save();

		userFunction.incrementField(UD.username, "comments_count", 1);


        // Respond with success message
        res.status(200).json({ message: MESSAGE.commentCreatedSuccessfully, 
			// Remove later, only for testing
			post: savedComment, 
			success: true
		});
    } catch (error) {
        res.status(500).json({ message: MESSAGE.couldNotAddComment(error), success: false });
    }
};


const createArticle = async (req, res) => {
	res.status(400).json({ message: MESSAGE.notUsedAnymore, success: false});
	return
	try {

		// If authentication succeeds, continue with createArticle logic
        const UD = req.userData; // Assuming req.user is properly set in middleware

		const userData = await User.findOne({ username: UD.username }).populate('role');

		
        // not tested
		//if (!userData) {
		//	res.status(400).json({ message: "User not found" });
		//	return;
		//}

		console.log(userData);

		// const hasPermission = userData.role.name === "Administrator" || userData.role.name === "Moderator";

		const hasPermission = helper.hasPermission(userData.role.name)



		if (!hasPermission) {
			res.status(401).json({ message: "Missing permissions" });
			return;
		}

        const { title, content, category, meta_tags, image } = req.body;
        
		if (!content) {
			res.status(400).json({ message: "Missing content", success: false});
			return;
		}

		if (!title) {
			res.status(400).json({ message: "Missing title", success: false});
			return;
		}

        // Generate new ObjectId for the post
        const newArticle = new Post({
            _id: new mongoose.Types.ObjectId(),
			user: userData._id,
			
			username: UD.username,
			title,
			content,
			category: category ?? "",
			meta_tags: meta_tags ?? [],
			created_at: new Date(),
			is_article: true,
			image
        });
        

        // Save the post to the database
        const savedArticle = await newArticle.save();

        // Respond with success message
        res.status(200).json({ message: 'Article created successfully', 
			// Remove later, only for testing
			post: savedArticle,
			success: true
		});
    } catch (error) {
        res.status(500).json({ message: error.message, success: false  });
    }
}


const addReaction = async (req, res) => {
	res.status(400).json({ message: MESSAGE.notUsedAnymore, success: false});
	return
	try {
		// If authentication succeeds, continue with addComment logic
        const UD = req.userData; // Assuming req.user is properly set in middleware
 
        const userData = await User.findOne({ username: UD.username });

        const { reaction, post_id } = req.body;
        
		if (!reaction) {
			res.status(400).json({ message: MESSAGE.missingReaction, success: false});
			return;
		}

		if (!post_id) {
			res.status(400).json({ message: MESSAGE.missingPostId, success: false});
			return;
		}


        // Generate new ObjectId for the post
        const newReaction = new Reaction({
            _id: new mongoose.Types.ObjectId(),
			user: userData._id,
			
			reaction,
			post_id,
			created_at: new Date(),
        });
        

        // Save the reaction to the database
        const savedReaction = await newReaction.save();

        // Respond with success message
        res.status(200).json({ message: MESSAGE.reactionAddedSuccessfully, 
			// Remove later, only for testing
			post: savedReaction, 
			success: true 
		});
    } catch (error) {
        res.status(500).json({ message: MESSAGE.couldnotAddReaction(error), success: false  });
    }
}


const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;

        // Retrieve comments by post ID
        const comments = await userFunction.getCommentsByPost(postId);

		// log the content of the comments
		const commentsWithEmojis = helper.convertEmojis(comments, "comment");


		res.status(200).json({ data: commentsWithEmojis, success: true });
    } catch (error) {
        res.status(500).json({ message: MESSAGE.couldNotGetCommentsByPost(error), success: false  });
    }
};


const getCommentsByUser = async (req, res) => {
	try {
		const { userId } = req.params;
		
        // Retrieve comments by user ID
        const comments = await userFunction.getCommentsByUser(userId);

		const commentsWithEmojis = helper.convertEmojis(comments, "comment");

		res.status(200).json({ data: commentsWithEmojis, success: true });
    } catch (error) {
		res.status(500).json({ message: MESSAGE.couldNotGetCommentsByUser(error), success: false  });
    }
};

const getPostById = async (req, res) => {
	try {
		const { postId } = req.params;

		// Retrieve post by post ID
		const post = await userFunction.getPostById(postId);

		const postWithEmojis = helper.convertEmojis(post, "article");


		res.status(200).json({ data: postWithEmojis, success: true });
	} catch (error) {
		res.status(500).json({ message: MESSAGE.administratorRole(error), success: false });
	}
};

const getFollowingPosts = async (req, res) => {
	try {
		const { amount } = req.params;
        const UD = req.userData; // Assuming req.user is properly set in middleware

		// Retrieve posts by user ID
		const posts = await userFunction.getFollowingPosts(UD._id ,amount);
		res.status(200).json({ data: posts, success: true });
	} catch (error) {
		res.status(500).json({ message: MESSAGE.couldNotGetFollowingPosts(error), success: false });
	}	
};


const getArticles = async (req, res) => {
    try {
        const articles = await userFunction.getArticles()

		const articlesWithEmojis = helper.convertEmojis(articles, "article");

        res.status(200).json(articlesWithEmojis);
    } catch (error) {
        res.status(500).json({ error: MESSAGE.failedToGetArticles(error.message), success: false});
    }
};

const sendMessage = async (req, res) => {
    try {
        const sender = req.userData._id; // Extract sender ID from authenticated user data
        const senderName = req.userData.username; // Extract sender ID from authenticated user data
        const { receiver, message } = req.body;
		console.log(req.body);

        // Check if sender and receiver are the same
        if (sender === receiver) {
            return res.status(400).json({ message: MESSAGE.cannotSendMessageToYourself, success: false});
        }

        const newMessage = new Messages({ sender, receiver, message });
        await newMessage.save();

		// Send a notification to the receiver
		userFunction.sendNotification(receiver, MESSAGE.messageFrom(senderName), MESSAGE.receivedMessage, sender);

        res.status(201).json({ message: MESSAGE.messageSentSuccessfully, success: true });
    } catch (error) {
        res.status(500).json({ message: MESSAGE.couldNotSendMessage(error), success: false});
    }
};

const getConversation = async (req, res) => {
    try {
        const userId1 = req.userData._id;
        const userId2 = req.params.userId; // Extract the user ID from the request parameters
        let amount = req.params.startAmount; // Extract the start amount of messages from the request parameters
        let amount2 = req.params.endAmount; // Extract the end amount of messages from the request parameters

        // Parse the amounts to integers
        amount = parseInt(amount);
        amount2 = parseInt(amount2);

        // Check if the provided amounts are valid numbers
        if (isNaN(amount) || isNaN(amount2)) {
           return res.status(400).json({ message: MESSAGE.amountsMustBeValidNumbers, success: false });
        }

        // Ensure amount and amount2 are positive integers
        if (amount < 0 || amount2 < 0) {
           return res.status(400).json({ message: MESSAGE.amountsMustBeNonNegativeIntegers, success: false });
        }

        // Ensure amount2 is greater than or equal to amount
        if (amount2 < amount) {
           return res.status(400).json({ message: MESSAGE.endAmountMustBeGreaterThanStartAmount, success: false });
        }

		// Check if values are not the same\
		if (amount === amount2) {
			return res.status(400).json({ message: MESSAGE.amountsMustBeDifferent, success: false });
		}

        // Query to find messages between userId1 and userId2
        const query = {
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 }
            ]
        };

        // Find messages between the users
        const findMessages = await Messages.find(query)
            .sort({ timestamp: -1 }) // Sort in descending order to get the latest messages first
            .skip(amount) // Skip the first 'amount' messages
            .limit(amount2 - amount) // Limit the number of messages based on the range
            .populate({
                path: 'sender', // Populate the sender
                select: 'username', // Select the username field
            })
            .populate({
                path: 'receiver', // Populate the receiver
                select: 'username', // Select the username field
            });
		
		const messages = helper.convertEmojis(findMessages, "message");


        return res.status(200).json({ messages, success: true });
    } catch (error) {
        return res.status(500).json({ message: MESSAGE.couldNotGetConversation(error), success: false });
    }
};

const readNotification = async (req, res) => {
	try {
        const userId = req.userData._id;
		const notificationId = req.params.notificationId;

		// Call readNotification method from userFunction to mark the notification as read
		const updatedNotification = await userFunction.readNotification(notificationId, userId);

		return res.status(200).json({ message: MESSAGE.notificationRead, success: true });
	} catch (error) {
		return res.status(500).json({ message: MESSAGE.couldNotReadNotification(error), success: false });
	}
}

const getChatContacts = async (req, res) => {
    try {
        const userId = req.userData._id;



        // Find all unique sender and receiver IDs where the authenticated user is involved
        const messages = await Messages.find({
            $or: [{ sender: userId }, { receiver: userId }]
        });

        const uniqueUserIds = new Set();
        messages.forEach(message => {
            if (message.sender.toString() !== userId.toString()) {
                uniqueUserIds.add(message.sender);
            }
            if (message.receiver.toString() !== userId.toString()) {
                uniqueUserIds.add(message.receiver);
            }
        });

        // Fetch user details for the unique user IDs
        const contacts = await User.find({ _id: { $in: Array.from(uniqueUserIds) } })
            .populate('role', 'name displayName color')
            .select('username profile_picture');

        res.status(200).json({ data: contacts, success: true});
    } catch (error) {
        res.status(500).json({ message: MESSAGE.couldNotGetChatContacts(error), success: false});
    }
};



const textDB = async (req, res, next) => {
	try {
		let property = req.params.property;
	
		if (property) {
			// Loop through all the objects like en and nl and de but we don't know how many there are
			let languages = Object.keys(_textDB);
			let text = {};
	
			for (let i = 0; i < languages.length; i++) {
				let lang = languages[i];
	
				// Check if the property is a function
				if (typeof _textDB[lang][property] == "function") {
					res.status(500).json({ message: MESSAGE.functionNotAllowed, success: false });
					return
				}
	
				text[lang] = _textDB[lang][property];
			}
			
			text.success = true;
			res.json(text);
		} else {
			let functionsIncluded = {};
			for (let lang in _textDB) {
				functionsIncluded[lang] = {};
				for (let key in _textDB[lang]) {
					if (typeof _textDB[lang][key] === 'function') {
						functionsIncluded[lang][key] = _textDB[lang][key].toString();
					} else {
						functionsIncluded[lang][key] = _textDB[lang][key];
					}
				}
			}
			res.json(functionsIncluded);
		}
	} catch (error) {
		return res.status(500).json({ message: MESSAGE.couldNotGetTextDB(error), success: false  });
	}
}


const addLike = async (req, res) => {
	try {
		const { commentId } = req.params; // Extract comment ID from the request parameters
		const userId = req.userData._id; // Extract user ID from authenticated user data
		const username = req.userData.username; // Extract user username from authenticated user data

		// Call addLike method from userFunction to add like to the comment
		const updatedPost = await userFunction.addLike(commentId, userId, username);

		return res.status(200).json({ message: MESSAGE.postLiked, success: true });
	} catch (error) {
		return res.status(500).json({ message: MESSAGE.couldNotAddLike(error), success: false });
	}
}

const addFollower = async (req, res) => {
    try {
        const { username } = req.params; // Extract username of the user to follow
        const followerUsername = req.userData.username; // Extract username of the follower from authenticated user data

        // Call addFollower method from userFunction to add follower
        const result = await userFunction.addFollower(username, followerUsername);
        
        // Check if the result contains a success message
        if (result.success) {
            return res.status(200).json({ message: result.message, success: true });
        } else {
            return res.status(400).json({ message: result.message, success: false });
			}
		} catch (error) {
			return res.status(500).json({ message: MESSAGE.couldNotAddFollower(error), success: false });
		}
	};


const addFollowing = async (req, res) => {
    try {
        const { username } = req.params; // Extract username of the user to follow
        const followingUsername = req.userData.username; // Extract username of the follower from authenticated user data

        // Call addFollowing method from userFunction to add following user
        const updatedUser = await userFunction.addFollowing(username, followingUsername);
		
        
        return res.status(200).json({ message: MESSAGE.youAreNowFollowing(username), success: true });
    } catch (error) {
        return res.status(500).json({ message: MESSAGE.couldNotAddFollowing(error), success: false });
    }
};



module.exports = { 
	createPost,
	createArticle,
	addComment, 
	addReaction,
	getCommentsByPost,
	getCommentsByUser,
	getArticles,
	sendMessage,
    getConversation,
	getChatContacts,
	addFollower,
    addFollowing,
	getPostById,
	getFollowingPosts,
	readNotification,
	textDB,
	addLike
}