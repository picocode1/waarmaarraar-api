const mongoose = require('mongoose');

const User = require('../routes/user/user.model');
const Comments = require('../routes/forum/models/comment.model')
const Role = require('../models/roles.model')
const Notification = require('../models/notification.model')
const Post = require('../routes/forum/models/post.model')
const Connection = require('../models/connections.model')



const user = user => { return { username: user }}


class userInfo {

	/* 
	* Get user info by username.
	* @param {string} username - The username of the user.
	* @param {string} authedUser - The username of the authenticated user.
	* @returns {Object} - The user object.
	* @throws {Error} - If getting user info fails.
	*/
	async getInfo(username, authedUser) {
		try {
			console.log({ "getInfo": username });
			const userData = await User.findOne(user(username)).select('-password -_id').populate('role'); // Exclude 'password' and '_id' fields from the query result
			// -notifications

			if (!userData) {
				return { message: "User not found", success: false };
			}

			// authedUser is the user who is currently logged in and user is the user whose profile is being viewed
			// If the user is private and the user is not the same as the authenticated user, return only the username
			if (userData.private && authedUser !== username) {
				return { username: userData.username, profile_picture: userData.profile_picture }
			}

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


	/**
	 * Get comments by user ID.
	 * @param {string} userId - The user ID.
	 * @returns {Array} - Array of comments.
	 * @throws {Error} If fetching comments fails.
	 */
	async getCommentsByUser(userId) {
		try {
			const comments = await Comments.find({ user_id: userId });
			return comments;
		} catch (error) {
			throw new Error(`Failed to get comments by user: ${error.message}`);
		}
	}

	/**
	 * Get comments by post ID.
	 * @param {string} postId - The post ID.
	 * @returns {Array} - Array of comments.
	 * @throws {Error} If fetching comments fails.
	 */
	async getCommentsByPost(postId) {
		try {
			const comments = await Comments.find({ post_id: postId }).populate('user', 'username profile_picture'); // Select only 'username' and 'profile_picture' fields for user

			
			return comments;
		} catch (error) {
			throw new Error(`Failed to get comments by post: ${error.message}`);
		}
	}

	/**
	 * Add a friend to the user's friend list.
	 * @param {string} username - The username of the friend to add.
	 * @returns {Object} - The updated user object.
	 * @throws {Error} If user not found or if adding friend fails.
	 */
	async addFriend(username) {
		try {
			// Step 1: Find the user by username to get their ID
			const user = await User.findOne({ username: username });
			if (!user) {
				throw new Error("User not found");
			}
	
			// Step 2: Update the user document to add the friend's ID to the friends array if it doesn't already exist
			const updatedUser = await User.findOneAndUpdate(
				{ username: username, "friends": { $nin: [user._id] } }, // Check if friend's ID doesn't already exist in the array
				{ $addToSet: { friends: user._id } }, // Add the friend's ID to the array if it doesn't already exist
				{ new: true } // Return the updated document
			);
	
			return updatedUser;
		} catch (error) {
			throw new Error(`Failed to add friend: ${error.message}`);
		}
	}


	/**
	 * Get the role of a user by username.
	 * @param {string} username - The username of the user.
	 * @returns {string} - The role name of the user.
	 * @throws {Error} If user not found or if getting user role fails.
	 * @example
	 * const role = await getUserRole("username");
	 * console.log(role); // "User"
	 * @returns {Promise<string>} - The role name of the user.
	 */
	async getUserRole(username) {
		try {
			// Find the user by username and populate the 'role' field
			const user = await User.findOne({ username }).populate('role_id');
			return user.role_id.name;
		} catch (error) {
			throw new Error(`Failed to get user role: ${error.message}`);
		}
	}
	
	/**
	 * Delete a user by username.
	 * @param {string} username - The username of the user to delete.
	 * @returns {Object} - The deleted user object.
	 * @throws {Error} If user not found or if deleting user fails.
	 * @example
	 * const deletedUser = await deleteUser("username");
	 * console.log(deletedUser); // { _id: ..., username: ..., ... }
	 * @returns {Promise<Object>} - The deleted user object.
	 * @throws {Error} - If user not found or if deleting user fails.
	 */
	async deleteUser(username) {
		try {
			// Find and delete the user by username
			const deletedUser = await User.findOneAndDelete({ username });
			return deletedUser;
		} catch (error) {
			throw new Error(`Failed to delete user: ${error.message}`);
		}
	}

	/**
	 * Create a notification for a specific user.
	 * @param {string} username - The username of the user to whom the notification belongs.
	 * @param {string} title - The title of the notification.
	 * @param {string} content - The content of the notification.
	 * @returns {Promise<Object>} - A Promise that resolves to the created notification object.
	 * @throws {Error} If creating notification fails.
	 */
	async createNotification(username, title, content, from_id) {
		try {
			// Find the user by username to get their ObjectId
			const user = await User.findOne({ username });
			if (!user) {
				throw new Error("User not found");
			}

			// Create a new notification document
			const notification = new Notification({
				user: user._id,
				title: title,
				content: content,
				from_id,
				created_at: new Date() // Assuming current date and time
			});

			// Save the notification document to the database
			const newNotification = await notification.save();

			return newNotification;
		} catch (error) {
			throw new Error(`Failed to create notification: ${error.message}`);
		}
	};

	/**
	 * Get notifications for a specific user by username.
	 * @param {string} username - The username of the user.
	 * @returns {Promise<Array>} - A Promise that resolves to an array of notification objects.
	 * @throws {Error} If getting notifications fails.
	 * @example
	 * const notifications = await getNotificationsByUsername("username");
	 * console.log(notifications); // [ { _id: ..., user: ..., title: ..., ... }, ... ]
	 * @returns {Promise<Array>} - An array of notification objects.
	 * @throws {Error} - If getting notifications fails.
	 */
	async getNotificationsByUsername(username)  {
		try {
			// Find the user by username to get their ObjectId
			const user = await User.findOne({ username });
			if (!user) {
				throw new Error("User not found");
			}
	
			// Find notifications for the user
			const notifications = await Notification.find({ user: user._id });
	
			return notifications;
		} catch (error) {
			throw new Error(`Failed to get notifications: ${error.message}`);
		}
	};

	// q: i love you copilot




	/**
	 * Get all articles.
	 * @returns {Promise<Array>} - An array of article objects.
	 * @throws {Error} - If getting articles fails.
	 */
	async getArticles() {
        try {
            // Find posts where is_article is true
			const articles = await Post.find({ is_article: true })
			.populate({
				path: 'user', // First, populate the user
				select: 'username profile_picture _id role name', // Select fields you want
				populate: { 
					path: 'role', // Then, within each populated user, populate the role
					select: 'name displayName color' // Select the name of the role, or more fields if needed
				}
			});
			console.log(articles);
            return articles;
        } catch (error) {
            throw new Error(`Failed to get articles: ${error.message}`);
        }
    }

	/**
	 * Add a follower to the user's followers list.
	 * @param {string} username - The username of the user.
	 * @param {string} followerUsername - The username of the follower to add.
	 * @returns {Object} - The updated user object.
	 * @throws {Error} - If user or follower not found, or if adding follower fails.
	 * @example
	 * const updatedUser = await addFollower("username", "followerUsername");
	 * console.log(updatedUser); // { _id: ..., username: ..., ... }
	 * @returns {Promise<Object>} - The updated user object.
	 * @throws {Error} - If user or follower not found, or if adding follower fails.
	 */
	async addFollower(username, followerUsername) {
		try {
			// Find the user by username to get their ID
			const user = await User.findOne({ username });
			if (!user) {
				throw new Error("User not found");
			}
	
			// Find the follower by username to get their ID
			const followerUser = await User.findOne({ username: followerUsername });
			if (!followerUser) {
				throw new Error("Follower not found");
			}
	
			// Find or create the connection document for the user
			let connection = await Connection.findOne({ user: user._id });
			if (!connection) {
				connection = new Connection({ user: user._id });
			}

			// Check if the follower's ID is already in the followers array
			if (connection.followers.includes(followerUser._id)) {
				return { message: `You are already following ${username}`, success: true }; // Return success message
			}
	
			

			// Update the connection document to add the follower's ID to the followers array
			connection.followers.push(followerUser._id);
			await connection.save(); // Save the updated connection document
	
			return { message: `You are now following ${followerUsername}`, success: true };
		} catch (error) {
			return { message: `Failed to add follower: ${error.message}`, success: false };
		}
	}
	
	
	
	

    async addFollowing(username, followingUsername) {
        try {
            // Find the user by username to get their ID
            const user = await User.findOne({ username });
            if (!user) {
                throw new Error("User not found");
            }

            // Find the user to be followed by username to get their ID
            const followingUser = await User.findOne({ username: followingUsername });
            if (!followingUser) {
                throw new Error("Following user not found");
            }



            // Update the user document to add the following user's ID to the following array if it doesn't already exist
            const updatedUser = await User.findOneAndUpdate(
                { username: username, "following": { $nin: [followingUser._id] } },
                { $addToSet: { following: followingUser._id } },
                { new: true }
            );

            return updatedUser;
        } catch (error) {
            throw new Error(`Failed to add following user: ${error.message}`);
        }
    }
	
};
module.exports = userInfo