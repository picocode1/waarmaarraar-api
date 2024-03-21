require('dotenv').config();

const fs = require("fs");
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


const helper = new (require('./functions/helper.function.js'));
const userInfo = new (require('./functions/user.function.js'));

const Role = require('./models/roles.model.js');

global.roles = {};
// Global object to store role IDs by role name


// userInfo.updateUserRank("rik", "Administrator")
// userInfo.incrementField("rik", "comments_count", 1)

// Function to populate the global roles object with role IDs
async function populateRolesObject() {
    try {
        // Fetch all roles from the database
        const allRoles = await Role.find();

        // Populate the global roles object
        for (let i = 0; i < allRoles.length; i++) {
            const role = allRoles[i];
            global.roles[role.name] = role._id.toString();
        }

        console.log("Global roles object populated successfully");
		console.log(global.roles);
    } catch (error) {
        console.error("Error populating global roles object:", error);
    }
}

// {
// 	Administrator: '65f1b5ed1503fb603012b964',
// 	Moderator: '65f1b616749e0190cea2e4f8',
// 	User: '65fa90d19b18b0bcf6c8b788'
// }

populateRolesObject()

// user.getInfo("rik").then(data => {
// 	console.log(data);

// 	{
// 		_id: new ObjectId('65f46988a75094879959bd0e'),
// 		username: 'rik',
// 		password: '$2b$10$.JLbKWmTnycWCwo4YDJhvOFPTbKbv5Syf37uCJBxOPZDMNA61tLYm',
// 		signup_date: 2024-03-15T15:30:16.536Z,
// 		profile_picture: '',
// 		name: '',
// 		residence: '',
// 		age: null,
// 		profession: '',
//		role: '65fa90d19b18b0bcf6c8b788',
// 		comments_count: 0,
// 		articles_count: 0,
// 		last_online: null,
// 		reactions_count: 0,
// 		forum_posts_count: 0,
// 		last_forum_post: null,
// 		tags: [],
// 		friends: []
// 	}
// })


app.engine('html', require('ejs').renderFile);

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

app.use(require('./middleware/sanitize.middleware'))
app.use(require('./middleware/logger.middleware'))
app.use(require('./middleware/mobile.middleware')) // req.isMobile - use anywhere to check if user is using a phone


app.use(express.static(__dirname + '/public'));
app.disable('x-powered-by');


fs.readdirSync('./routes').forEach(file => {
	console.log(`Loading in ./routes/${file}/${file}.controller.js`);
	app.use(`/${file}/`, require(`./routes/${file}/${file}.controller`));
});

app.get("/", (req, res) => {
	res.send("hello")
})


app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));

mongoose.connect(process.env.MONGO_URL);
mongoose.connection.on('connected', () => console.log('Server is connected to the database.'));

var urls = new Set()

function print(path, layer) {
	if (layer.route) {
		layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))))
	} else if (layer.name === 'router' && layer.handle.stack) {
		layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))))
	} else if (layer.method) {
		let url = layer.method.toUpperCase() +" /" + path.concat(split(layer.regexp)).filter(Boolean).join('/')
		urls.add(url)
	}
}

function split(thing) {
	if (typeof thing === 'string') {
		return thing.split('/')
	} else {
		var match = thing.toString()
			.replace('\\/?', '')
			.replace('(?=\\/|$)', '$')
			.match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
		return match ?
			match[1].replace(/\\(.)/g, '$1').split('/') :
			'<complex:' + thing.toString() + '>'
	}
}
app._router.stack.forEach(print.bind(null, []))

// print out all of the possible 
urls.forEach(url => {
	console.log(url);
})