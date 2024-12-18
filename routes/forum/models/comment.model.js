const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		auto: true,
	},
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post', // Refers to the User model
        required: true
    },
    content: String,
    created_at: Date,
	liked_by: Array,
	// is_emoji: Boolean,
	// emoji: String
}, { versionKey: false });


// Create the User model based on the schema
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;