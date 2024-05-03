const mongoose = require('mongoose');

const User = require('../routes/user/user.model');
const Comments = require('../routes/forum/models/comment.model')
const Role = require('../models/roles.model')
const Notification = require('../models/notification.model')
const Post = require('../routes/forum/models/post.model')
const Connection = require('../models/connections.model')

require('dotenv').config();
const MESSAGE = require('../textDB/messages.text')[process.env.LANGUAGE];



const getUsername = user => { return { username: { $regex: new RegExp("^" + user, "i") } }}

class userFunction {

	/**
	 *
	 * @param {string} username - The username of the user.
	 * @param {string} authedUser - The username of the authenticated user.
	 * @param {boolean} isID - Whether the username is an ID.
	 * @returns {Object} - The user object.
	 * @throws {Error} - If user not found or if getting user info fails.
	 * @example
	 * const user = await userFunction.getInfo("username", "authedUser", false);
	 * console.log(user); // { _id: ..., username: ..., ... }
	 */
	async getInfo(username, authedUser, isID) {
		try {
			console.log({ "getInfo": username });
	
			let userData;
	
			if (isID) {
				userData = await User.findById(username)
					.select('-password')
					.populate({
						path: 'role',
						select: 'name displayName color'
					})		
			} else {
				userData = await User.findOne(getUsername(username))
					.select('-password')
					.populate({
						path: 'role',
						select: 'name displayName color'
					})
			}
	
			if (!userData) {
				return { message: MESSAGE.userNotFound, success: false };
			}
	
			const connectionData = await Connection.findOne({ user: userData._id })
				.populate({
					path: 'followers',
					select: 'username _id'
				})
				.populate({
					path: 'following',
					select: 'username _id'
				});

			let data = JSON.parse(JSON.stringify(userData));
			
			// Calculate the user's age based on their birthday
			if (userData.birthday) {
				const ageDate = new Date(Date.now() - userData.birthday.getTime());
				const age = Math.abs(ageDate.getUTCFullYear() - 1970);
				data.age = age;
			}

			data.followers = connectionData.followers;
			data.following = connectionData.following;


			// console.log(typeof(userData))

			if (userData.private && authedUser !== username) {
				return { username: userData.username, profile_picture: userData.profile_picture }
			}
			
			// console.log(userData);

			return data;
		} catch (error) {
			throw new Error(MESSAGE.failedToGetuserFunction(error));
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
				throw new Error(MESSAGE.roleNotFound);
			}

			// Find the user document by username
			const user = await User.findOne(getUsername(username)).populate('role')

			if (user.role.name != MESSAGE.administratorRole) {
				return MESSAGE.userNotAdministrator
			}


			if (!user) {
				return MESSAGE.userNotFound;
			}

			// Update the user's role with the role ID
			user.role = role._id;
			await user.save();

			return user; // Optionally return the updated user document
		} catch (error) {
			throw new Error(MESSAGE.failedToUpdateUserRank(error));
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
				throw new Error(MESSAGE.userNotFound);
			}

			return updatedUser;
		} catch (error) {
			throw new Error(MESSAGE.failedToIncrementField);
		}
	}

	// add date to last_forum_post
	async updateLastPost(username) {
		try {
			// Find the user document by username and increment the specified field
			const updatedUser = await User.findOneAndUpdate( 
				{ username: username },
				{ last_forum_post: new Date() },
				{ new: true } // Return the updated document
			);
			return updatedUser;
		}
		catch (error) {
			throw new Error(MESSAGE.failedToUpdateLastForumPost(error));
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
			const comments = await Comments.find({ user: userId }).populate('post_id', '-user')
			return comments;
		} catch (error) {
			throw new Error(MESSAGE.failedToGetCommentsByUser(error));
		}
	}

	/**
	 * Get posts by user ID.
	 * @param {string} userId - The user ID.
	 * @returns {Array} - Array of posts.
	 * @throws {Error} If fetching posts fails.
	 * @example
	 * const posts = await getPostsByUser("rik");
	 * console.log(posts); // [ { _id: ..., title: ..., ... }, ... ]
	 * @returns {Promise<Array>} - An array of post objects.
	 *
	*/
	async getPostById(userId) {
		try {
			const posts = await Post.find({ user: userId });
			return posts;
		} catch (error) {
			throw new Error(MESSAGE.failedToGetPostsByUser(error));
		}
	}


	async getFollowingPosts(userId, amount) {
		try {
			// Find the user by ID
			const user = await User.findById(userId);
			if (!user) {
				throw new Error(MESSAGE.userNotFound);
			}
	
			// Find the user's connections
			const connections = await Connection.findOne({ user: userId });
			if (!connections) {
				throw new Error(MESSAGE.usersConnectionsNotFound);
			}
	
			// Get the IDs of the users that the current user follows
			const followingIds = connections.following.map(following => following.toString());
	
			console.log(followingIds);
			
			// Find posts by the user and their friends
			const posts = await Post.find({ user: { $in: followingIds } })
				.sort({ created_at: -1 }) // Sort by newest posts first
				.limit(amount) // Limit the number of posts
				.populate({
					path: 'user',
					select: 'profile_picture'
				});
			
			return posts;
		} catch (error) {
			throw new Error(MESSAGE.failedToGetFriendsPosts(error));
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
			throw new Error(MESSAGE.failedToGetCommentsByPost(error));;
		}
	}



	/**
	 * Add a friend to the user's friend list.
	 * @param {string} username - The username of the friend to add.
	 * @returns {Object} - The updated user object.
	 * @throws {Error} If user not found or if adding friend fails.
	 */
	//async addFriend(username) {
	//	try {
	//		// Step 1: Find the user by username to get their ID
	//		const user = await User.findOne(getUsername(username));
	//		if (!user) {
	//			throw new Error("User not found");
	//		}
	//
	//		// Step 2: Update the user document to add the friend's ID to the friends array if it doesn't already exist
	//		const updatedUser = await User.findOneAndUpdate(
	//			{ username: username, "friends": { $nin: [user._id] } }, // Check if friend's ID doesn't already exist in the array
	//			{ $addToSet: { friends: user._id } }, // Add the friend's ID to the array if it doesn't already exist
	//			{ new: true } // Return the updated document
	//		);
	//
	//		return updatedUser;
	//	} catch (error) {
	//		throw new Error(`Failed to add friend: ${error.message}`);
	//	}
	//}


	/**
	 * Get the role of a user by username.
	 * @param {string} username - The username of the user.
	 * @returns {string} - The role name of the user.
	 * @throws {Error} If user not found or if getting user role fails.
	 * @example
	 * const role = await getUsernameRole("username");
	 * console.log(role); // "User"
	 * @returns {Promise<string>} - The role name of the user.
	 */
	async getUsernameRole(username) {
		try {
			// Find the user by username and populate the 'role' field
			const user = await User.findOne(getUsername(username)).populate('role');
			return user.role.name;
		} catch (error) {
			throw new Error(MESSAGE.failedToGetUserRole(error));
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
			throw new Error(MESSAGE.failedToDeleteUser(error));
		}
	}

	/**
	 * Create a notification for a specific user.
	 * @param {string} to_id - The id of the user to whom the notification belongs.
	 * @param {string} title - The title of the notification.
	 * @param {string} content - The content of the notification.
	 * @param {string} from_id - The ID of the user who sent the notification.
	 * @returns {Promise<Object>} - A Promise that resolves to the created notification object.
	 * @throws {Error} If creating notification fails.
	 */
	async sendNotification(to_id, title, content, from_id) {
		try {
			// Find user by id
			const user = await User.findById(to_id);
			if (!user) {
				throw new Error(MESSAGE.userNotFound);
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
			throw new Error(MESSAGE.failedToCreateNotification(error));
		}
	};

	/**
	 * Get notifications for a specific user by username.
	 * @param {string} username - The username of the user.
	 * @returns {Promise<Array>} - A Promise that resolves to an array of notification objects.
	 * @throws {Error} If getting notifications fails.
	 * @example
	 * const notifications = await userFunction.getNotifications("username");
	 * console.log(notifications); // [ { _id: ..., user: ..., title: ..., ... }, ... ]
	 * @returns {Promise<Array>} - An array of notification objects.
	 * @throws {Error} - If getting notifications fails.
	 */
	async getNotifications(id)  {
		try {
			console.log({ "getNotifications": id });
			// Find the user by username to get their ObjectId
			const user = await User.findById(id);
			if (!user) {
				throw new Error(MESSAGE.userNotFound);
			}
	
			// Find notifications for the user
			const notifications = await Notification.find({ user: user._id });
	
			return notifications;
		} catch (error) {
			throw new Error(MESSAGE.failedToGetNotifications(error));
		}
	};




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
			throw new Error(MESSAGE.failedToGetArticles(error));
        }
    }


	// const updatedUser = await userFunction.updateUser(authedUser, name, residence, birthday, profession, tags);
	
	async updateUser(authedUser, name, residence, birthday, profession, tags, path) {
		try {
			// Find the user by username
			const user = await User.findOne(getUsername(authedUser.username));
			if (!user) {
				throw new Error(MESSAGE.userNotFound);
			}

			// Cap the number of tags at 10
			tags.length = 10;
			
			// Filter out undefined values
			tags = tags.filter(tag => tag !== undefined);

			// Parse birthday string to a Date object (Dutch date format)
			const dateRegex = /(\d{2})-(\d{2})-(\d{4})/;
			const [, day, month, year] = birthday.match(dateRegex); // Using destructuring to extract matched groups
			
			// Note: Month is zero-based in JavaScript Date objects, so we subtract 1 from the month value
			const birthdayDate = new Date(year, month - 1, day);


			// Update the user's fields
			user.name = name;
			user.residence = residence;
			user.birthday = birthdayDate;
			user.profession = profession;
			user.tags = tags;
			user.profile_picture = path;

			// Save the updated user document
			await user.save();
	
			return user;
		} catch (error) {
			throw new Error(MESSAGE.failedToUpdateUser(error));
		}
	}

	async readNotification(notificationId, userId) {
		try {

			const notification = await Notification.findOne({ _id: notificationId, user: userId });

			if (!notification) {
				throw new Error(MESSAGE.notificationNotFound);
			}
			// Update the notification to mark it as read
			notification.hasRead = true;
			await notification.save();
			
		} catch (error) {
			throw new Error(MESSAGE.failedToReadNotification(error));
		}

		// try {
		// 	// Find the notification by ID
		// 	const notification = await Notification.findById(notificationId);
		// 	if (!notification) {
		// 		throw new Error(MESSAGE.notificationNotFound);
		// 	}
	
		// 	// Update the notification to mark it as read
		// 	notification.read = true;
		// 	await notification.save();
	
		// 	return notification;
		// } catch (error) {
		// 	throw new Error(MESSAGE.failedToReadNotification(error.message));
		// }
	}

	async updateLastOnline(id) {
		try {
			// Find the user document by id and increment the specified field
			const updatedUser = await User.findOneAndUpdate({ _id: id }, { last_online: new Date() }, { new: true });
			return updatedUser;
		}
		catch (error) {
			throw new Error(MESSAGE.failedToUpdateLastOnline(error));
		}
	}


//	async areFriends(userId1, userId2) {
//		try {
//			// Find both users by their IDs
//			const user1 = await User.findById(userId1).populate('following');
//			const user2 = await User.findById(userId2).populate('following');
//	
//			// Check if both users exist
//			if (!user1 || !user2) {
//				throw new Error("One or both users not found");
//			}
//	
//			// Check if user1 follows user2 and vice versa
//			const user1FollowsUser2 = user1.following.some(followedUser => followedUser._id.equals(userId2));
//			const user2FollowsUser1 = user2.following.some(followedUser => followedUser._id.equals(userId1));
//	
//			console.log(user1FollowsUser2, user2FollowsUser1);
//
//
//			// If both users follow each other, they are friends
//			return user1FollowsUser2 && user2FollowsUser1;
//		} catch (error) {
//			throw new Error(`Failed to check friendship: ${error.message}`);
//		}
//	}
		
	
	
};
module.exports = userFunction