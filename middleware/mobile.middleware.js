var MobileDetect = require('mobile-detect')

module.exports = function(req, res, next) {
	let mobile = new MobileDetect(req.headers['user-agent']);
	req.isMobile = mobile.mobile() != null;
    next();
};