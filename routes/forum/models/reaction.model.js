const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		auto: true,
	},
    user: mongoose.Schema.Types.ObjectId,
    post_id: mongoose.Schema.Types.ObjectId,
    reaction_id: Number,
    created_at: Date,
}, { versionKey: false });


// Create the User model based on the schema
const Reaction = mongoose.model('Reaction', userSchema);

module.exports = Reaction;
