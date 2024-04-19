const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
		const authHeader = req.headers['authorization'];
		
		if (!authHeader) {
			return res.status(401).json({ message: 'Missing auth header', success: false });
		}

		const token = authHeader.split('Bearer ')[1]; // Extract the token from the Authorization header

		if (!token) {
		  return res.status(401).json({ message: 'No token provided', success: false });
		}


        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token is close to expiring (e.g., within 5 hours)
        const currentTime = Math.floor(Date.now() / 1000);
        const tokenExpirationThreshold = 5 * 3600; // 5 hours in seconds
        if (decoded.exp - currentTime <= tokenExpirationThreshold) {
            // Token is close to expiring, refresh the token
            const refreshedToken = jwt.sign({ _id: decoded._id, username: decoded.username }, process.env.JWT_SECRET, { expiresIn: '12h' }); // Example: Refresh token for 1 hour
            res.setHeader('Authorization', `Bearer ${refreshedToken}`);
        }

        // Set decoded user data in the request object for further processing
        req.userData = decoded;

        next();
    
    } catch (error) {
		if (error.message == 'jwt must be provided') {
			console.log('Missing JWT token.')
		} else console.error(error);
		
	
        // res.redirect('/');
		// res.clearCookie(process.env.JWT_NAME)
        res.status(401).json({ message: error.message, success: false  });
    }
}