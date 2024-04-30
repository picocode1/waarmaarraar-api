const jwt = require('jsonwebtoken');


require('dotenv').config();
const MESSAGE = require('../textDB/messages.text')[process.env.LANGUAGE];


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

		// Check if the token is close to expiring (e.g., within 24 hours)
		const currentTime = Math.floor(Date.now() / 1000);
		const tokenExpirationThreshold = 24 * 3600; // 24 hours in seconds
		if (decoded.exp - currentTime <= tokenExpirationThreshold) {
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