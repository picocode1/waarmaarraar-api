const mongoose = require('mongoose');

const User = require('../user/user.model.js');

const Post = require('./models/post.model.js');
const Comment = require('./models/comment.model.js');
const Reaction = require('./models/reaction.model.js');

const Role = require('../../models/roles.model.js');

const userInfo = new (require('../../functions/user.function.js'));

const Message = require('../../models/message.model.js');

const Connection = require('../../models/connections.model.js')


const createPost = async (req, res) => {
    try {
		// If authentication succeeds, continue with createPost logic
        const UD = req.userData; // Assuming req.user is properly set in middleware

        const userData = await User.findOne({ username: UD.username });

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
        const newPost = new Post({
            _id: new mongoose.Types.ObjectId(),
			user: userData._id,
			
			username: UD.username,
			title,
			content,
			category: category ?? "",
			meta_tags: meta_tags ?? [],
			created_at: new Date(),
			is_article: false,
			image
        });
        

        // Save the post to the database
        const savedPost = await newPost.save();

		// Increment the forum_posts_count field in the user document
		userInfo.incrementField(UD.username, "forum_posts_count", 1);
		
		// lastForumPost
		userInfo.updateLastPost(UD.username);

        // Respond with success message
        res.status(200).json({ message: 'Post created successfully', 
			// Remove later, only for testing
			post: savedPost,
			success: true
		});
    } catch (error) {
        res.status(500).json({ message: error.message, success: false  });
    }
};


const addComment = async (req, res) => {
    try {
		// If authentication succeeds, continue with addComment logic
        const UD = req.userData; // Assuming req.user is properly set in middleware
 
        const userData = await User.findOne({ username: UD.username });

        const { content, post_id } = req.body;
        
		if (!content) {
			res.status(400).json({ message: "Missing content", success: false});
			return;
		}

		if (!post_id) {
			res.status(400).json({ message: "Missing post id", success: false});
			return;
		}


        // Generate new ObjectId for the post
        const newComment = new Comment({
            _id: new mongoose.Types.ObjectId(),
			user: userData._id,
			
			content,
			post_id,
			created_at: new Date(),
        });
        

        // Save the comment to the database
        const savedComment = await newComment.save();

        // Respond with success message
        res.status(200).json({ message: 'Comment created successfully', 
			// Remove later, only for testing
			post: savedComment, 
			success: true
		});
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};


const createArticle = async (req, res) => {
	try {
		// If authentication succeeds, continue with createArticle logic
        const UD = req.userData; // Assuming req.user is properly set in middleware

		const userData = await User.findOne({ username: UD.username }).populate('notifications').populate('role');

		
        // not tested
		//if (!userData) {
		//	res.status(400).json({ message: "User not found" });
		//	return;
		//}

		console.log(userData);

		const hasPermission = userData.role.name === "Administrator" || userData.role.name === "Moderator";



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
	try {
		// If authentication succeeds, continue with addComment logic
        const UD = req.userData; // Assuming req.user is properly set in middleware
 
        const userData = await User.findOne({ username: UD.username });

        const { reaction, post_id } = req.body;
        
		if (!reaction) {
			res.status(400).json({ message: "Missing reaction", success: false});
			return;
		}

		if (!post_id) {
			res.status(400).json({ message: "Missing post id", success: false});
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
        res.status(200).json({ message: 'Reaction added successfully', 
			// Remove later, only for testing
			post: savedReaction, 
			success: true 
		});
    } catch (error) {
        res.status(500).json({ message: error.message, success: false  });
    }
}


const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;

        // Retrieve comments by post ID
        const comments = await userInfo.getCommentsByPost(postId);
		res.status(200).json({ data: comments, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false  });
    }
};


const getCommentsByUser = async (req, res) => {
	try {
		const { userId } = req.params;
		
        // Retrieve comments by user ID
        const comments = await userInfo.getCommentsByUser(userId);
		res.status(200).json({ data: comments, success: true });
    } catch (error) {
		res.status(500).json({ message: error.message, success: false  });
    }
};

const getPostById = async (req, res) => {
	try {
		const { postId } = req.params;

		// Retrieve post by post ID
		const post = await userInfo.getPostById(postId);
		res.status(200).json({ data: post, success: true });
	} catch (error) {
		res.status(500).json({ message: error.message, success: false });
	}
};

const getFollowingPosts = async (req, res) => {
	try {
		const { amount } = req.params;
        const UD = req.userData; // Assuming req.user is properly set in middleware

		// Retrieve posts by user ID
		const posts = await userInfo.getFollowingPosts(UD._id ,amount);
		res.status(200).json({ data: posts, success: true });
	} catch (error) {
		res.status(500).json({ message: error.message, success: false });
	}	
};


const getArticles = async (req, res) => {
    try {
        const articles = await userInfo.getArticles()
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ error: `Failed to get articles: ${error.message}`, success: false});
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
            return res.status(400).json({ message: 'Cannot send message to yourself' });
        }

        const newMessage = new Message({ sender, receiver, message });
        await newMessage.save();

		// Send a notification to the receiver
		userInfo.sendNotification(receiver, `New message from ${senderName}`, 'You have received a new message', sender);

        res.status(201).json({ message: 'Message sent successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false});
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
           return res.status(400).json({ message: "Amounts must be valid numbers", success: false });
        }

        // Ensure amount and amount2 are positive integers
        if (amount < 0 || amount2 < 0) {
           return res.status(400).json({ message: "Amounts must be non-negative integers", success: false });
        }

        // Ensure amount2 is greater than or equal to amount
        if (amount2 < amount) {
           return res.status(400).json({ message: "End amount must be greater than start amount", success: false });
        }

		// Check if values are not the same\
		if (amount === amount2) {
			return res.status(400).json({ message: "Amounts must be different", success: false });
		}

        // Query to find messages between userId1 and userId2
        const query = {
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 }
            ]
        };

        // Find messages between the users
        const messages = await Message.find(query)
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

        return res.status(200).json({ messages, success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};



const getChatContacts = async (req, res) => {
    try {
        const userId = req.userData._id;

        // Find all unique sender and receiver IDs where the authenticated user is involved
        const messages = await Message.find({
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
        res.status(500).json({ message: error.message, success: false});
    }
};


const addFollower = async (req, res) => {
    try {
        const { username } = req.params; // Extract username of the user to follow
        const followerUsername = req.userData.username; // Extract username of the follower from authenticated user data

        // Call addFollower method from userInfo to add follower
        const result = await userInfo.addFollower(username, followerUsername);
        
        // Check if the result contains a success message
        if (result.success) {
            return res.status(200).json({ message: result.message, success: true });
        } else {
            return res.status(400).json({ message: result.message, success: false });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
};


const addFollowing = async (req, res) => {
    try {
        const { username } = req.params; // Extract username of the user to follow
        const followingUsername = req.userData.username; // Extract username of the follower from authenticated user data

        // Call addFollowing method from userInfo to add following user
        const updatedUser = await userInfo.addFollowing(username, followingUsername);
		
        
        return res.status(200).json({ message: `You are now following ${username}`, success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
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
	getFollowingPosts
}