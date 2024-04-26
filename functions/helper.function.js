const emoji = require('node-emoji');

var helper = class helper {

	/**
	 * Normalize a string
	 * @param {string} string
	 * @param {boolean} lowercase
	 * @returns {string}
	 * @example
	 * helper.normalize('Hello World'); // 'Hello World'
	 * helper.normalize('Hello World', true); // 'hello world'
	 * helper.normalize('Héllö Wörld'); //'Hello World'
	 * helper.normalize('Héllö Wörld', true); //'hello world'
	 * 
	*/
	normalize(string, lowercase) {
		if (!string || string == undefined) return false 

		var string = string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
		return lowercase ? string.toLowerCase() : string;
	}

	/**
	 * Check if a string has unicode characters
	 * @param {string} string
	 * @returns {boolean}
	 * @example
	 * helper.hasUnicode('Hello World'); // false
	 * helper.hasUnicode('Héllö Wörld'); // true
	*/ 

	hasUnicode(string) {
		const regex = /[^\u0000-\u00ff]/; // Small performance gain from pre-compiling the regex
		return regex.test(string);
	}


	/**
	 * Generate a random string
	 * @param {number} length
	 * @returns {string}
	 * @example
	 * helper.randomString(10); // 'CBYCVgh6WyRguQFfCIn'
	 * 
	*/
	randomString(length) {
		const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		let result = '';
		for (let i = length; i > 0; --i) {
			result += chars[Math.floor(Math.random() * chars.length)];
		}
		return result;
	}


	/**
	 * Convert a unix timestamp to a date
	 * 
	 * @param {number} unix
	 * @returns {string}
	 * @example
	 * helper.convertDate(1675858398625); // '18 maart, 2024'
	 * 
	*/
	convertDate(unix) {
		const dateObject = new Date(unix)

		let month = dateObject.toLocaleString("nl-NL", {month: "long"}) // December
		let day = dateObject.toLocaleString("nl-NL", {day: "numeric"}) // 9
		let year = dateObject.toLocaleString("nl-NL", {year: "numeric"}) // 2019

		return `${day} ${month}, ${year}`
	}

	/**
	 * Get a user by username
	 * 
	 * @param {string} user
	 * @returns {object}
	 * @example
	 * helper.getUsername('rik'); // { username: { '$regex': /^rik/i } }
	 * 	
	*/
	getUsername = user => { return { username: { $regex: new RegExp("^" + user, "i") } }}

	/**
	 * Check if a user has a certain role
	 * 
	 * @param {string} role
	 * @returns {boolean}
	 * @example
	 * helper.hasPermission('Administrator'); // true
	 * helper.hasPermission('Moderator'); // true
	 * helper.hasPermission('User'); // false
	 *
	*/
	hasPermission = role => { return role === "Administrator" || role === "Moderator" }


	// Function to convert emojis in comment content

	/**
	 * Convert emojis in a string
	 * 
	 * @param {string} data
	 * @param {string} type
	 * @returns {string}
	 * @example
	 * helper.convertEmojis('Hello :smile:', 'comment'); // 'Hello 😄
	 *
	*/
	convertEmojis = (data, type) => {
		switch (type) {
			case 'comment':
				return data.map(comment => {
					const content = comment.content.trim();
					const isEmoji = emoji.has(content)
			
					// Create a deep copy of the comment object
					const updatedComment = JSON.parse(JSON.stringify(comment));
			
					// Update the content and onlyEmoji properties in the copied comment
					updatedComment.content = emoji.emojify(content)
					updatedComment.onlyEmoji = isEmoji;
			
					return updatedComment;
				})
			case 'article':
				return data.map(article => {
					const content = article.content.trim();
					const title = article.title.trim();
	
					// Create a deep copy of the comment object
					const updatedArticle = JSON.parse(JSON.stringify(article));
			
					// Update the content and onlyEmoji properties in the copied comment
					updatedArticle.content = emoji.emojify(content)
					updatedArticle.title = emoji.emojify(title)
			
					return updatedArticle;
				})

			case 'message':
				return data.map(messages => {
					const message = messages.message.trim();

					// Create a deep copy of the comment object
					const updatedMessage = JSON.parse(JSON.stringify(messages));
			
					// Update the content and onlyEmoji properties in the copied comment
					updatedMessage.message = emoji.emojify(message)
	
					return updatedMessage;
				})
			default:
				return emoji.emojify(data)
		}
	}
};
module.exports = helper