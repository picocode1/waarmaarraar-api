const mongoose = require('mongoose');

const User = require('../user/user.model.js');

const Post = require('./models/post.model.js');
const Comment = require('./models/comment.model.js');
const Reaction = require('./models/reaction.model.js');

const Role = require('../../models/roles.model.js');

const userInfo = new (require('../../functions/user.function.js'));




const createPost = async (req, res) => {
    try {
		// If authentication succeeds, continue with createPost logic
        const UD = req.userData; // Assuming req.user is properly set in middleware

        const userData = await User.findOne({ username: UD.username });

        const { title, content, category, meta_tags, image } = req.body;
        
		if (!content) {
			res.status(400).json({ message: "Missing content" });
			return;
		}
		if (!title) {
			res.status(400).json({ message: "Missing title" });
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
			res.status(400).json({ message: "Missing content" });
			return;
		}

		if (!post_id) {
			res.status(400).json({ message: "Missing post id" });
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
        res.status(500).json({ message: error.message, success: false  });
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
			res.status(400).json({ message: "Missing content" });
			return;
		}

		if (!title) {
			res.status(400).json({ message: "Missing title" });
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
			res.status(400).json({ message: "Missing reaction" });
			return;
		}

		if (!post_id) {
			res.status(400).json({ message: "Missing post id" });
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
		res.status(200).json({ comments, success: true });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false  });
    }
};

const getCommentsByUser = async (req, res) => {
	try {
		const { userId } = req.params;
		
        // Retrieve comments by user ID
        const comments = await userInfo.getCommentsByUser(userId);
		res.status(200).json({ comments, success: true });
    } catch (error) {
		res.status(500).json({ message: error.message, success: false  });
    }
};

const getArticles = async (req, res) => {
    try {
        const articles = await userInfo.getArticles()
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ error: `Failed to get articles: ${error.message}` });
    }
};

module.exports = { 
	createPost,
	createArticle,
	addComment, 
	addReaction,
	getCommentsByPost,
	getCommentsByUser,
	getArticles
}