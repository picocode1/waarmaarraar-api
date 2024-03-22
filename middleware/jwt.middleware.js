const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.cookies[process.env.JWT_NAME];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

		console.log("Decoded JWT:", decoded);

		req.userData = decoded;

		if (!decoded) res.redirect('/logout');


		if (Math.floor(+new Date() / 1000) > decoded.exp) {
			res.clearCookie(process.env.JWT_NAME)
			res.redirect('/')
		} else next();
    
    } catch (error) {
		if (error.message == 'jwt must be provided') {
			console.log('Missing JWT token.')
		} else console.error(error);
		
	
        // res.redirect('/');
		res.clearCookie(process.env.JWT_NAME)
        res.status(401).json({ message: error.message, success: false  });
    }
}