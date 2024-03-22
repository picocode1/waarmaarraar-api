const sanitize = require('mongo-sanitize');

module.exports = function(req, res, next) {
    if (req.body) req.body = sanitize(req.body);
    next();
};