const jwt = require('jsonwebtoken');
const userFunction = new (require('../functions/user.function.js'));
const helper = new (require('../functions/helper.function.js'));


require('dotenv').config();
const MESSAGE = require('../textDB/messages.text')[process.env.LANGUAGE];


// Object to keep track of JWT check counts for each user
const jwtCheckCounts = {};


module.exports = (req, res, next) => {
	try {
		const authHeader = req.headers['authorization'];

		if (!authHeader) {
			return res.status(401).json({ message: MESSAGE.missingAuthHeader, success: false });
		}

		const token = authHeader.split('Bearer ')[1]; // Extract the token from the Authorization header

		if (!token) {
			return res.status(401).json({ message: MESSAGE.noTokenProvided, success: false });
		}



		const decoded = jwt.verify(token, process.env.JWT_SECRET);


		// Check if user exists in jwtCheckCounts object, if not initialize count to 0
		if (!jwtCheckCounts[decoded._id]) {
			jwtCheckCounts[decoded._id] = {
				count: 0,
				lastCheckedAt: Date.now()
			};
		}

		// Increment JWT check count for the user
		jwtCheckCounts[decoded._id].count++;

		// Check if it's time to update the database
		const checkInterval = 10; // Number of JWT checks before updating the database
		const resetTime = helper.toMinutes(10); // Reset interval 10 minutes
		const currentTime = Date.now();
		if (jwtCheckCounts[decoded._id].count >= checkInterval || currentTime - jwtCheckCounts[decoded._id].lastCheckedAt > resetTime) {
			// Update the last online field in the database
			userFunction.updateLastOnline(decoded._id);
			// console.log("Updated last online field in the database", decoded._id)

			// Reset count and last checked time
			jwtCheckCounts[decoded._id].count = 0;
			jwtCheckCounts[decoded._id].lastCheckedAt = currentTime;
		}

		console.log(jwtCheckCounts);

		// Update the last online field of the user


		// Check if the token is close to expiring (e.g., within 24 hours)
		const currentTimeInSeconds = Math.floor(Date.now() / 1000);
		const tokenExpirationThreshold = 24 * 3600; // 24 hours in seconds
		if (decoded.exp - currentTimeInSeconds <= tokenExpirationThreshold) {
			// Token is close to expiring, refresh the token
			const refreshedToken = jwt.sign({ _id: decoded._id, username: decoded.username }, process.env.JWT_SECRET, { expiresIn: '12h' }); // Refresh token for 12 hours
			res.setHeader('Authorization', `Bearer ${refreshedToken}`);
		}


		// Set decoded user data in the request object for further processing
		req.userData = decoded;

		next();
	
	} catch (error) {
		if (error.message == 'jwt must be provided') {
			console.log(MESSAGE.missingJWTToken)
		} else console.error(error);
		
	
		// res.redirect('/');
		// res.clearCookie(process.env.JWT_NAME)
		res.status(401).json({ message: error.message, success: false  });
	}
}