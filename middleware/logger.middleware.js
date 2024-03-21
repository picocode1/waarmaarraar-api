// logger.middleware.js

const loggerMiddleware = (req, res, next) => {
    const now = new Date();
	const formattedDate = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;

    console.log(`[${formattedDate}] ${req.method} ${req.url}`);

    // Check if it's a POST request
    if (req.method === 'POST') {
        if (req.body) {
            console.log('\t\t     Request Body:', JSON.stringify(req.body));
        }
    }
    next();
};

module.exports = loggerMiddleware;
