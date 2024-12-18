const mongoose = require('mongoose');

// const Role = require('../../models/roles.model'); // Adjust the path as needed

// Define the schema for the User model
const userSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true,
    },
    username: { type: String, required: true },
    password: { type: String, required: true },
    signup_date: { type: Date, required: true },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role', // Refers to the Role model
        required: true
    },
    profile_picture: String,
    name: String,
    residence: String,
    birthday: Date,
    profession: String,
    comments_count: Number,
    articles_count: Number,
    last_online: Date,
    reactions_count: Number,
    forum_posts_count: Number,
    last_forum_post: Date,
    tags: [String],
    //notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }], // Reference to the Notification model
    private: Boolean,
	connection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Connection'
    }
}, { versionKey: false });

// Create the User model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User;
