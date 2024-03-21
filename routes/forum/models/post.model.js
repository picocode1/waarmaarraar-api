const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		auto: true,
	},
    user_id: mongoose.Schema.Types.ObjectId,
    category: String,
    title: String,
    content: String,
    created_at: Date,
    meta_tags: [String],
	is_article: Boolean,
}, { versionKey: false });


// Create the User model based on the schema
const Post = mongoose.model('Post', userSchema);

module.exports = Post;
