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
        const { receiver, message } = req.body;
		console.log(req.body);

        // Check if sender and receiver are the same
        if (sender === receiver) {
            return res.status(400).json({ message: 'Cannot send message to yourself' });
        }

        const newMessage = new Message({ sender, receiver, message });
        await newMessage.save();

		// Send a notification to the receiver
		userInfo.sendNotification(receiver, 'New message', 'You have received a new message', sender);

        res.status(201).json({ message: 'Message sent successfully', success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false});
    }
};

const getConversation = async (req, res) => {
    try {
        const userId1 = req.userData._id;
        const userId2 = req.params.userId; // Extract the user ID from the request parameters
        let amount = req.params.amount; // Extract the amount of messages from the request parameters

        // Check if amount parameter exists and is a valid number
        if (amount !== undefined && !isNaN(amount)) {
            amount = parseInt(amount);
            // Check if amount is within the allowed range (0 to 100)
            if (amount < 0 || amount > 100) {
                return res.status(400).json({ message: "Amount must be between 0 and 100", success: false });
            }
        } else {
            amount = 10000; // Set amount to 10000 if not provided or not a number
        }

        var id = new mongoose.Types.ObjectId(userId2);
        // Check if userid2 exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }w

        let query = {
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 }
            ]
        };

		let messagesQuery = Message.find(query)
		.sort({ timestamp: -1 }) // Sort in descending order to get the latest messages first
		.limit(amount) // Replace X with the desired number of messages
		.populate({
			path: 'sender', // Populate the sender
			select: 'username', // Select the username field
		})
		.populate({
			path: 'receiver', // Populate the receiver
			select: 'username', // Select the username field
		});

        // Limit the number of messages if amount parameter is provided
        //if (amount !== null) {
        //    messagesQuery = (await messagesQuery).reverse().slice(0, amount).reverse();
        //}

        const messages = await messagesQuery;

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
    addFollowing
}