const bcrypt = require('bcrypt');
const User = require('../../routes/user/user.model.js');

const userInfo = new (require('../../functions/user.function.js'));

const jwt = require('jsonwebtoken');

const loginUser = async (req, res, next) => {

	const { username, password } = req.body;
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
        const token = jwt.sign({ _id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '12h' });

        // Attach user and token to request object
        req.user = user;
        req.token = token;
		
		// Set the cookie en send json token back
		res.cookie('JWT_TOKEN', token, { httpOnly: true });
		res.status(200).json({ message: "You have been logged in successfully", jwt: token });

    } catch (error) {
        res.status(500).json({ message: error.message });
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

    const usernameExists = await User.findOne({ username });
    
    if (usernameExists) {
        return res.status(200).json({
            success: false,
            message: 'Username already exists'
        });
    }

    if (password.length < 8) {
        return res.status(200).json({
            success: false,
            message: 'Password must be atleast 8 characters'
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
		profile_picture: '',
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

const getUser = async (req, res, next) => {
	let username = req.params.username
	

	userInfo.getInfo(username).then(data => {

		// need to stringify to fix for model
		//_id: new ObjectId('65fa9784b2faffeafca95f20'),
		//SyntaxError: Expected property name or '}' in JSON at position 4 (line 2 column 3)


		let json = JSON.parse(JSON.stringify(data))
		delete json.password;
		delete json._id;

		return res.status(200).json(json);
	})
}

// const getComments = async (req, res, next) => {
// 	let id = req.params.id
// 	let postId = req.params.postId
// 	userInfo.getComments(id, postId).then(data => {
// 		console.log(data)
// 		return res.status(200).json(data);
// 	})
// }


module.exports = { loginUser, registerUser, getUser, /* getComments */ };