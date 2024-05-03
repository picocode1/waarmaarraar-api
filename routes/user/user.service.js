require('dotenv').config();

const bcrypt = require('bcrypt');
const User = require('../../routes/user/user.model.js');

const Notification = require('../../models/notification.model.js');
const userFunction = new (require('../../functions/user.function.js'));
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const imageType = require('file-type-mime').parse;
const fs = require('fs')

const MESSAGE = require('../../textDB/messages.text')[process.env.LANGUAGE];
const _textDB = require('../../textDB/messages.text');
const { log } = require('winston');


const ObjectId = require('mongoose').Types.ObjectId;

const helper = new (require('../../functions/helper.function.js'));

const loginUser = async (req, res, next) => {
	const { username, password } = req.body;

    try {

		// Validate the request
		if (!username || !password) {
			return res.status(200).json({
				success: false,
				message: MESSAGE.missingRequiredFields
			});
		}
        // Find the user by username
        const user = await User.findOne(helper.getUsername(username));
        if (!user) {
			console.log(user);
            return res.status(404).json({ message: MESSAGE.userNotFound, success: false });
        }

        // Compare passwords
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
			console.log(match);
            return res.status(401).json({ message: MESSAGE.invalidCredentials, success: false });
        }

        // Generate JWT token
        const token = jwt.sign({ _id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '31d' });

        // Attach user and token to request object
        req.user = user;
        req.token = token;
		
		// Set the cookie en send json token back
		// res.cookie('JWT_TOKEN', token, { httpOnly: true });
		res.status(200).json({ _id: user._id, message: MESSAGE.loggedInSuccessfully(user.username), jwt: token, success: true });
    } catch (error) {
        res.status(500).json({ message: MESSAGE.cantLogin(error), success: false });
    }
    
};


const registerUser = async (req, res, next) => {
	const { username, password } = req.body;

	try {
		if (!username || !password) {
			return res.status(200).json({
				success: false,
				message: MESSAGE.missingRequiredFields
			});
		}
		
		const usernameExists = await User.findOne(helper.getUsername(username));

		if (usernameExists) {
			return res.status(200).json({
				success: false,
				message: MESSAGE.usernameAlreadyExists
			});
		}
		if (username.length < 3) {
			return res.status(200).json({
				success: false,
				message: MESSAGE.usernameMustBeAtLeastThreeCharacters
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
			profile_picture: MESSAGE.defaultProfilePicture,
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
			message: MESSAGE.userCreatedSuccessfully,
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
	} catch (error) {
        res.status(500).json({ message: MESSAGE.couldNotRegisterUser(error), success: false });
	}
}


// need to update
const logoutUser = async (req, res, next) => {
	try {
		res.clearCookie(process.env.JWT_NAME)
	} catch (error) {
		return res.status(500).json({ message: MESSAGE.couldNotLogoutUser(error), success: false  });
	}
}



//TODO: 
// Test image upload and correct path to save image
// make sure to make a PUT request to update user info

const updateUser = async (req, res, next) => {
    const authedUser = req.userData;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    try {
        const { name, residence, birthday, profession, tags, profile_picture } = req.body;

        // Convert base64 data to a buffer
        const imageBuffer = Buffer.from(profile_picture.split(';base64,').pop(), 'base64');

        // Check the image type
        const imageInfo = imageType(imageBuffer);
        if (!imageInfo || !allowedTypes.includes(imageInfo.mime)) {
            return res.status(500).json({ message: MESSAGE.invalidImageType, success: false });
        }
        const extension = imageInfo.ext;

		// should be like "661f9b533fb2c0bcd0366685.png"
        const fileName = `${authedUser._id}.${extension}`;

		let path = `/images/${fileName}`

		// Save the image to the public/images folder
		const image = fs.createWriteStream("public" + path);
		image.write(imageBuffer);
		image.end();

		const updatedUser = await userFunction.updateUser(authedUser, name, residence, birthday, profession, tags, path);

		return res.status(200).json({ message: MESSAGE.userUpdatedSuccessfully, success: true });
	} catch (error) {
		// Return error response
        res.status(500).json({ message: MESSAGE.couldNotUpdateUser(error), success: false });
	}
}





const addFriend = async (req, res, next) => {
    try {
		let username = req.params.username

		if (username == req.userData.username) {
			return res.status(500).json({ message: MESSAGE.cannotAddYourself, success: false })
		}

        const updatedUser = await userFunction.addFriend(username);

        return res.status(200).json({ message: MESSAGE.friendAddedSuccessfully, success: false   });
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
        const newNotification = await userFunction.createNotification(username, title, content, UD._id);

        // Return the created notification in the response
        return res.status(200).json({
            success: true,
            message: MESSAGE.notificationCreatedSuccessfully,
            notification: newNotification
        });
    } catch (error) {
        // Return error response
        return res.status(500).json({ message: MESSAGE.couldNotSendMessage(error), success: false});
    }
};

const getNotifications = async (req, res, next) => {
    try {
        const id = req.userData._id;

        // Continue with retrieving notifications for the current user
        // Example logic to retrieve notifications...
        const notifications = await userFunction.getNotifications(id);

        // Return the notifications
        res.status(200).json({ data: notifications, success: true });
    } catch (error) {
        // Handle any errors
        return res.status(500).json({ message: MESSAGE.couldNotGetNotification(error), success: false});
    }
};

const getUser = async (req, res, next) => {
	try {
		let username = req.params.username
		const authedUser = req.userData.username;
		
		let isID = ObjectId.isValid(username)
		
		userFunction.getInfo(username, authedUser, isID).then(data => {
	
			// need to stringify to fix for model
			//_id: new ObjectId('65fa9784b2faffeafca95f20'),
			//SyntaxError: Expected property name or '}' in JSON at position 4 (line 2 column 3)

			let json = JSON.parse(JSON.stringify(data))
			res.status(200).json(json);
			return;
		})
	} catch (error) {
		// Return error response
		return res.status(500).json({ message: MESSAGE.couldNotGetUser(error), success: false  });
	}
}

const textDB = async (req, res, next) => {
	try {
		let property = req.params.property;
	
		if (property) {
			// Loop through all the objects like en and nl and de but we don't know how many there are
			let languages = Object.keys(_textDB);
			let text = {};
	
			for (let i = 0; i < languages.length; i++) {
				let lang = languages[i];
	
				// Check if the property is a function
				if (typeof _textDB[lang][property] == "function") {
					res.status(500).json({ message: _textDB.functionNotAllowed, success: false });
					return
				}
	
				text[lang] = _textDB[lang][property];
			}
	
			text.success = true;
			res.json(text);
		} else {
			res.json(_textDB);
		}
	} catch (error) {
		return res.status(500).json({ message: MESSAGE.couldNotGetTextDB(error), success: false  });
	}
}


module.exports = { loginUser, registerUser, getUser, logoutUser, addFriend, sendMessage, getNotifications, updateUser, textDB };