const User = require('../routes/user/user.model');
const Comments = require('../routes/forum/models/comment.model')
const Role = require('../models/roles.model')


const user = user => { return { username: user }}

class userInfo {

	/**
	 * Get user information by username.
	 * @param {string} username - The username of the user.
	 * @returns {Object} userData - The user data object.
	 * @throws {Error} If user information retrieval fails.
	 */
	async getInfo(username) {
		try {
			console.log({ "getInfo": username });
			const userData = await User.findOne(user(username));

			return userData;
		} catch (error) {
			throw new Error(`Failed to get user info: ${error.message}`);
		}
	}

	/**
	 * Update user rank by assigning a new role to the user.
	 * @param {string} username - The username of the user.
	 * @param {string} roleName - The name of the role to assign to the user.
	 * @returns {Object} user - The updated user object.
	 * @throws {Error} If role or user not found, or if updating user rank fails.
	 */
	async updateUserRank(username, roleName) {
		try {
			// Find the role document by name
			const role = await Role.findOne({ name: roleName });

			if (!role) {
				throw new Error("Role not found");
			}

			// Find the user document by username
			const user = await User.findOne({ username });

			if (!user) {
				throw new Error("User not found");
			}

			// Update the user's role with the role ID
			user.role = role._id;
			await user.save();

			return user; // Optionally return the updated user document
		} catch (error) {
			throw new Error(`Failed to update user rank: ${error.message}`);
		}
	}

	/**
	 * Increment a numeric field in the user document.
	 * @param {string} username - The username of the user.
	 * @param {string} fieldName - The name of the field to increment.
	 * @param {number} incrementBy - The amount by which to increment the field.
	 * @returns {Object} updatedUser - The updated user object.
	 * @throws {Error} If user not found or if incrementing field fails.
	 */
	async incrementField(username, fieldName, incrementBy) {
		try {
			// Find the user document by username and increment the specified field
			const updatedUser = await User.findOneAndUpdate(
				{ username: username },
				{ $inc: { [fieldName]: incrementBy } },
				{ new: true } // Return the updated document
			);

			if (!updatedUser) {
				throw new Error("User not found");
			}

			return updatedUser;
		} catch (error) {
			throw new Error(`Failed to increment field: ${error.message}`);
		}
	}

	async getComments(id, postId) {
		console.log({"getComments": id, "postId": postId})

		if (!postId) {
			return Comments.find({user_id: id}).then(json => {
				return json
			})
		}
		
		return Comments.find({user_id: id, post_id: postId}).then(json => {
			return json
		})
	}

	async getCommentsByUser(userId) {
		try {
			const comments = await Comments.find({ user_id: userId });
			return comments;
		} catch (error) {
			throw new Error(`Failed to get comments by user: ${error.message}`);
		}
	}
	
	async getCommentsByPost(postId) {
		try {
			const comments = await Comments.find({ post_id: postId });
			return comments;
		} catch (error) {
			throw new Error(`Failed to get comments by post: ${error.message}`);
		}
	}

	getPosts(username) {
		/* .. */
	}
	
};
module.exports = userInfo