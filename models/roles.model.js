const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: String
}, { versionKey: false });

// Register the "Role" model with Mongoose
const Role = mongoose.model('Role', roleSchema);

module.exports = Role;