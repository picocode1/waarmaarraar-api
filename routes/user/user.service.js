const bcrypt = require('bcrypt');
const User = require('../../routes/user/user.model.js');

const Notification = require('../../models/notification.model.js');
const userInfo = new (require('../../functions/user.function.js'));
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


const ObjectId = require('mongoose').Types.ObjectId;

const helper = new (require('../../functions/helper.function.js'));

const loginUser = async (req, res, next) => {

	const { username, password } = req.body;
    try {

		// Validate the request
		if (!username || !password) {
			return res.status(200).json({
				success: false,
				message: 'Missing required fields'
			});
		}
	
        // Find the user by username
        const user = await User.findOne(helper.getUsername(username));
        if (!user) {
			console.log(user);
            return res.status(404).json({ message: 'User not found', success: false });
        }

        // Compare passwords
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
			console.log(match);
            return res.status(401).json({ message: 'Invalid credentials', success: false });
        }

        // Generate JWT token
        const token = jwt.sign({ _id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '31d' });

        // Attach user and token to request object
        req.user = user;
        req.token = token;
		
		// Set the cookie en send json token back
		// res.cookie('JWT_TOKEN', token, { httpOnly: true });
		res.status(200).json({ message: "You have been logged in successfully", jwt: token, success: true });

    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
    
};


const registerUser = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
		return res.status(200).json({
			success: false,
			message: 'Missing required fields'
		});
    }

	const usernameExists = await User.findOne(helper.getUsername(username));

	if (usernameExists) {
		return res.status(200).json({
			success: false,
			message: 'Username already exists'
		});
	}
    if (username.length < 3) {
        return res.status(200).json({
            success: false,
            message: 'username must be atleast 3 characters'
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
		// Set on register
		// _id: new mongoose.Types.ObjectId(),
        username,
        password: hashedPassword,
		signup_date: new Date(),

		// Be able to changed later
		profile_picture: '/images/default.jpg',
		name: '',
		role: global.roles["User"], // Using the _id of the default role document
		residence: '',
		age: null,
		profession: '',
		comments_count: 0,
		articles_count: 0,
		last_online: null,
		reactions_count: 0,
		forum_posts_count: 0,
		last_forum_post: null,
		tags: [], // Assuming tags are stored as an array of strings
		friends: []
    });

    await newUser.save();

    return res.status(200).json({
        success: true,
        message: 'User created successfully',
    });

	// id: { type: mongoose.Schema.Types.ObjectId },
    // _id: { type: Buffer },
    // username: { type: String, required: true },
    // password: { type: String, required: true },
    // signup_date: { type: Date, required: true },

    // role_id: { type: Number },
    // profile_picture: { type: String },
    // name: { type: String },
    // residence: { type: String },
    // age: { type: Number },
    // profession: { type: String },
    // comments_count: { type: Number },
    // articles_count: { type: Number },
    // last_online: { type: Date },
    // reactions_count: { type: Number },
    // forum_posts_count: { type: Number },
    // last_forum_post: { type: Date },
    // tags: { type: [String] } // Assuming tags are stored as an array of strings

}


// need to update
const logoutUser = async (req, res, next) => {
	res.clearCookie(process.env.JWT_NAME)
}

const updateUser = async (req, res, next) => {
	try {
		const authedUser = req.userData

		const { name, residence, birthday, profession, tags } = req.body;

		const updatedUser = await userInfo.updateUser(authedUser, name, residence, birthday, profession, tags);

		return res.status(200).json({ message: "User updated successfully", success: true });
	} catch (error) {
		// Return error response
		return res.status(500).json({ message: error.message, success: false  });
	}
}





const addFriend = async (req, res, next) => {
    try {
		let username = req.params.username

		if (username == req.userData.username) {
			return res.status(500).json({ message: "You cannot add yourself", success: false })
		}

        const updatedUser = await userInfo.addFriend(username);

        return res.status(200).json({ message: "Friend added successfully", success: false   });
    } catch (error) {
        // Return error response
        return res.status(500).json({ message: error.message, success: false  });
    }
};

const sendMessage = async (req, res, next) => {
    try {
        const UD = req.userData; // Assuming req.user is properly set in middleware

		let username = req.params.username

        const { title, content } = req.body;

        // Call the createNotification method to create the notification
        const newNotification = await userInfo.createNotification(username, title, content, UD._id);

        // Return the created notification in the response
        return res.status(200).json({
            success: true,
            message: 'Notification created successfully',
            notification: newNotification
        });
    } catch (error) {
        // Return error response
        return res.status(500).json({ message: error.message, success: false});
    }
};

const getNotifications = async (req, res, next) => {
    try {
        const id = req.userData._id;

        // Continue with retrieving notifications for the current user
        // Example logic to retrieve notifications...
        const notifications = await userInfo.getNotifications(id);

        // Return the notifications
        res.status(200).json({ data: notifications, success: true });
    } catch (error) {
        // Handle any errors
        return res.status(500).json({ message: error.message, success: false});
    }
};

const getUser = async (req, res, next) => {
	try {
		let username = req.params.username
		const authedUser = req.userData.username;
		
		let isID = ObjectId.isValid(username)
		
		userInfo.getInfo(username, authedUser, isID).then(data => {
	
			// need to stringify to fix for model
			//_id: new ObjectId('65fa9784b2faffeafca95f20'),
			//SyntaxError: Expected property name or '}' in JSON at position 4 (line 2 column 3)

			let json = JSON.parse(JSON.stringify(data))
			res.status(200).json(json);
			return;
		})
	} catch (error) {
		// Return error response
		return res.status(500).json({ message: error.message, success: false  });
	}
}


module.exports = { loginUser, registerUser, getUser, logoutUser, addFriend, sendMessage, getNotifications, updateUser };