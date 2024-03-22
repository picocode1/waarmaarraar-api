const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		auto: true,
	},
    user_id: mongoose.Schema.Types.ObjectId,
    post_id: mongoose.Schema.Types.ObjectId,
    content: String,
    created_at: Date,
}, { versionKey: false });



// Create the User model based on the schema
const Comment = mongoose.model('Comment', userSchema);

module.exports = Comment;
