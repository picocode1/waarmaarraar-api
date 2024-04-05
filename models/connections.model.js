const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { versionKey: false });

// Register the "Connection" model with Mongoose
const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;