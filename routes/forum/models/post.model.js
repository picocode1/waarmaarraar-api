const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		auto: true,
	},
	username: String,
    user: { // Change from user_id to user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model
        required: true
    },
    category: String,
    title: String,
    content: String,
    created_at: Date,
    meta_tags: [String],
	is_article: Boolean,
	image: String,
}, { versionKey: false });


// Create the User model based on the schema
const Post = mongoose.model('Post', userSchema);

module.exports = Post;
