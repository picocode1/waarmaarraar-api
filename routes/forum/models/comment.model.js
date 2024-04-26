const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		auto: true,
	},
    user: { // Change from user_id to user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true
    },
    post_id: mongoose.Schema.Types.ObjectId,
    content: String,
    created_at: Date,
	// is_emoji: Boolean,
	// emoji: String
}, { versionKey: false });


// Create the User model based on the schema
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;