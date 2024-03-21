const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../routes/user/user.model.js');
const Forum = require('../routes/forum/forum.model.js');

// this code is not used anymore


const authenticateUser = async (req, res, next) => {
	console.log("authenticateUser", new Date())
    
	// return res.status(200).json({ message: 'testing' });
	const { username, password } = req.body;
    console.log(username, password);
    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
			console.log(user);
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
			console.log(match);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '12h' });

        // Attach user and token to request object
        req.user = user;
        req.token = token;

        // Proceed to the next middleware
        next();
    } catch (error) {
        // Handle unexpected errors
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Internal server error' });
		next();
    }
};

module.exports = { 
    authenticateUser
};
