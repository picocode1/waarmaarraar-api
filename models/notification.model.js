const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    hasRead: {
        type: Boolean,
        default: false, // Default value for hasRead
    },
    from_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    title: String,
    content: String,
    created_at: {
        type: Date,
        default: Date.now, // Default value for created_at
    },
}, { versionKey: false });

// Register the "Role" model with Mongoose
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;