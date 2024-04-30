require('dotenv').config();

const fs = require("fs");
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const https = require('https');

const helper = new (require('./functions/helper.function.js'));
const userInfo = new (require('./functions/user.function.js'));

const Role = require('./models/roles.model.js');

const winston = require('winston');
const { createLogger, format, transports } = winston;
const { combine, label, printf } = format;
const DailyRotateFile = require('winston-daily-rotate-file');


const MESSAGE = require('./textDB/messages.text')[process.env.LANGUAGE];

// Global object to store role IDs by role name

// userInfo.updateUserRank("rik", "Administrator")
// userInfo.incrementField("rik", "comments_count", 1)
// userInfo.getInfo("rik")

// userInfo.areFriends("65fab62d10ca366b23aa9a0d", "65fab62d10ca366b23aa9a0d").then(data => {
// 	console.log(data);
// })
	
// userInfo.getUserRole("rik").then(data => {
// 	console.log(data);
// })
		
		
		global.roles = {};
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

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

app.use(require('./middleware/sanitize.middleware'))
// app.use(require('./middleware/logger.middleware'))
app.use(require('./middleware/mobile.middleware')) // req.isMobile - use anywhere to check if user is using a phone


// Define log format
const logFormat = printf(({ level, message, label}) => {
    const now = new Date();
	const formattedDate = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;

    return `[${formattedDate}] ${message}`;
});

// Create Winston logger
const logger = createLogger({
    format: combine(
        label({ label: 'WMR' }),
        logFormat
    ),
    transports: [
        // Console transport
        new transports.Console({
            format: combine(
                format.colorize(),
                logFormat
            )
        }),
        // DailyRotateFile transport
        new DailyRotateFile({
            filename: 'logs/%DATE%.log',
            datePattern: 'DD-MM-YYYY',
            maxSize: '20m',
            maxFiles: '31d'
        })
    ]
});

// Middleware to log requests
app.use((req, res, next) => {
	// URL Decoding for logging
	const URL = decodeURIComponent(req.originalUrl);
    let loggerText = `${req.method} ${URL}`;

    if (req.method === 'POST' && req.body) {
        loggerText += `\n\t\t        Request Body: ${JSON.stringify(req.body)}`;
    }

    logger.info(loggerText);
    next();
});

// Set headers for CORS
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Max-Age', 600); // remove later
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Requested-With, Content-Type, Accept');
	next();
});



app.use(express.static(__dirname + '/public'));
app.disable('x-powered-by');


fs.readdirSync('./routes').forEach(file => {
	console.log(`Loading in ./routes/${file}/${file}.controller.js`);
	app.use(`/${file}/`, require(`./routes/${file}/${file}.controller`));
});



app.get("/api", (req, res) => {
    const sortedRoutes = [...urls].sort((a, b) => {
        // Extract path prefixes
        const prefixA = a.split('/')[1];
        const prefixB = b.split('/')[1];

        // Compare path prefixes first
        const prefixComparison = prefixA.localeCompare(prefixB);
        if (prefixComparison !== 0) {
            return prefixComparison;
        }

        // If path prefixes are the same, compare full routes
        return a.localeCompare(b);
    });

    res.json({
        routes: sortedRoutes,
        success: true,
    });
});

const SSL = {
	key: fs.readFileSync('./certificates/ssl_private_key.key'),
	cert: fs.readFileSync('./certificates/ssl_certificate.crt')
};

const server = https.createServer(SSL, app);

server.listen(process.env.PORT, () => console.log(MESSAGE.serverRunningPort(process.env.PORT)));

mongoose.connect(process.env.MONGO_URL);
mongoose.connection.on('connected', () => console.log(MESSAGE.serverConnected));

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
		return match ? match[1].replace(/\\(.)/g, '$1').split('/') : '<complex:' + thing.toString() + '>'
	}
}
app._router.stack.forEach(print.bind(null, []))

// print out all of the possible 
urls.forEach(url => {
	console.log(url);
})

// Error handler
app.get("*", (req, res, next) => {
	res.status(212).json({ message: MESSAGE.URLNotFound, success: false  });
});