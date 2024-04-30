// messages.js

const MESSAGE = {
	// English messages
	en: {
		// General messages
		administratorRole: 'Administrator',
		moderatorRole: 'Moderator',
		userRole: 'User',
		serverConnected: 'Server is connected to the database.',
		serverRunningPort: port => `Server is running on port ${port}`,
		URLNotFound: 'URL not found',

		// user.function.js
		failedToGetUserInfo: errorMessage => `Failed to get user info: ${errorMessage}`,
		userNotFound: 'User not found',
		roleNotFound: 'Role not found',
		userNotAdministrator: 'User is not an administrator',
		failedToUpdateUserRank: 'Failed to update user rank',
		failedToIncrementField: 'Failed to increment field',
		failedToUpdateLastForumPost: error => `Failed to update last forum post: ${error.message}`,
		failedToGetCommentsByUser: error => `Failed to get comments by user: ${error.message}`,
		failedToGetPostsByUser: error => `Failed to get posts by user: ${error.message}`,
		usersConnectionsNotFound: "User's connections not found",
		failedToGetFriendsPosts: error => `Failed to get friends posts: ${error.message}`,
		failedToGetCommentsByPost: error => `Failed to get comments by post: ${error.message}`,
		failedToGetUserRole: error => `Failed to get user role: ${error.message}`,
		failedToDeleteUser: error => `Failed to delete user: ${error.message}`,
		failedToCreateNotification: error => `Failed to create notification: ${error.message}`,
		failedToGetNotifications: error => `Failed to get notifications: ${error.message}`,
		failedToGetArticles: error => `Failed to get articles: ${error.message}`,
		failedToUpdateUser: error => `Failed to update user: ${error.message}`,

		// jwt.middleware.js
		missingAuthHeader: 'Missing auth header',
		noTokenProvided: 'No token provided',
		missingJWTToken: 'Missing JWT token',

		// forum.controller.js
		tooManyRequests: 'Too many requests, please try again later.',
		tooManyRequestsForSendingMessages: 'Too many requests for sending messages, please try again later.',

		// forum.service.js
		missingContent: 'Missing content',
		missingTitle: 'Missing title',
		postCreatedSuccessfully: 'Post created successfully',
		missingPostId: 'Missing post id',
		commentCreatedSuccessfully: 'Comment created successfully',
		notUsedAnymore: 'Not used anymore',
		missingReaction: 'Missing reaction',
		reactionAddedSuccessfully: 'Reaction added successfully',
		failedToGetArticles: error => `Failed to get articles: ${error.message}`,
		cannotSendMessageToYourself: 'Cannot send message to yourself',
		messageFrom: senderName => `New message from ${senderName}`,
		receivedMessage: 'You have received a new message',
		messageSentSuccessfully: 'Message sent successfully',
		amountsMustBeValidNumbers: 'Amounts must be valid numbers',
		amountsMustBeNonNegativeIntegers: 'Amounts must be non-negative integers',
		endAmountMustBeGreaterThanStartAmount: 'End amount must be greater than start amount',
		amountsMustBeDifferent: 'Amounts must be different',
		youAreNowFollowing: username => `You are now following ${username}`,

		// user.controller.js
		tooManyRequestsForLoginOrRegister: 'Too many requests for login or register, please try again later.',

		// user.service.js
		missingRequiredFields: 'Missing required fields',
		invalidCredentials: 'Invalid credentials',
		loggedInSuccessfully: username => `You have been logged in successfully as ${username}`,
		usernameAlreadyExists: 'Username already exists',
		usernameMustBeAtLeastThreeCharacters: 'Username must be at least 3 characters',
		defaultProfilePicture: '/images/default.jpg',
		userCreatedSuccessfully: 'User created successfully',
		userUpdatedSuccessfully: 'User updated successfully',
		cannotAddYourself: 'You cannot add yourself',
		friendAddedSuccessfully: 'Friend added successfully',
		notificationCreatedSuccessfully: 'Notification created successfully',
	},

	// Dutch messages
	nl: {
		// General messages
		administratorRole: 'Administrator',
		moderatorRole: 'Moderator',
		userRole: 'User',
		serverConnected: 'Server is verbonden met de database.',
		serverRunningPort: port => `Server draait op poort ${port}`,
		URLNotFound: 'URL niet gevonden',
		
		// user.function.js
		failedToGetUserInfo: error => `Het ophalen van gebruikersgegevens is mislukt: ${error}`,
		userNotFound: 'Gebruiker niet gevonden',
		roleNotFound: 'Rol niet gevonden',
		userNotAdministrator: 'Gebruiker is geen beheerder',
		failedToUpdateUserRank: 'Het bijwerken van de gebruikersrang is mislukt',
		failedToIncrementField: 'Het veld kon niet worden verhoogd',
		failedToUpdateLastForumPost: error => `Het bijwerken van het laatste forumbericht is mislukt: ${error.message}`,
		failedToGetCommentsByUser: error => `Reacties van gebruiker konden niet worden opgehaald: ${error.message}`,
		failedToGetPostsByUser: error => `Berichten van gebruiker konden niet worden opgehaald: ${error.message}`,
		usersConnectionsNotFound: "De connecties van de gebruiker zijn niet gevonden",
		failedToGetFriendsPosts: error => `Berichten van vrienden konden niet worden opgehaald: ${error.message}`,
		failedToGetCommentsByPost: error => `Reacties op bericht konden niet worden opgehaald: ${error.message}`,
		failedToGetUserRole: error => `Gebruikersrol kon niet worden opgehaald: ${error.message}`,
		failedToDeleteUser: error => `Gebruiker kon niet worden verwijderd: ${error.message}`,
		failedToCreateNotification: error => `Notificatie kon niet worden aangemaakt: ${error.message}`,
		failedToGetNotifications: error => `Notificaties konden niet worden opgehaald: ${error.message}`,
		failedToGetArticles: error => `Artikelen konden niet worden opgehaald: ${error.message}`,
		failedToUpdateUser: error => `Gebruiker kon niet worden bijgewerkt: ${error.message}`,

		// jwt.middleware.js
		missingAuthHeader: 'Ontbrekende authenticatie header',
		noTokenProvided: 'Geen token verstrekt',
		missingJWTToken: 'JWT-token ontbreekt',

		// forum.controller.js
		tooManyRequests: 'Te veel verzoeken, probeer het later opnieuw.',
		tooManyRequestsForSendingMessages: 'Te veel verzoeken om berichten te verzenden, probeer het later opnieuw.',

		// forum.service.js
		missingContent: 'Inhoud ontbreekt',
		missingTitle: 'Titel ontbreekt',
		postCreatedSuccessfully: 'Bericht succesvol aangemaakt',
		missingPostId: 'Bericht id ontbreekt',
		commentCreatedSuccessfully: 'Reactie succesvol aangemaakt',
		notUsedAnymore: 'Niet meer in gebruik',
		missingReaction: 'Reactie ontbreekt',
		reactionAddedSuccessfully: 'Reactie succesvol toegevoegd',
		failedToGetArticles: error => `Artikelen konden niet worden opgehaald: ${error.message}`,
		cannotSendMessageToYourself: 'Kan geen bericht naar jezelf sturen',
		messageFrom: senderName => `Nieuw bericht van ${senderName}`,
		receivedMessage: 'Je hebt een nieuw bericht ontvangen',
		messageSentSuccessfully: 'Bericht succesvol verzonden',
		amountsMustBeValidNumbers: 'Bedragen moeten geldige getallen zijn',
		amountsMustBeNonNegativeIntegers: 'Bedragen moeten niet-negatieve gehele getallen zijn',
		endAmountMustBeGreaterThanStartAmount: 'Eindbedrag moet groter zijn dan startbedrag',
		amountsMustBeDifferent: 'Bedragen moeten verschillend zijn',
		youAreNowFollowing: username => `Je volgt nu ${username}`,

		// user.controller.js
		tooManyRequestsForLoginOrRegister: 'Te veel verzoeken voor aanmelden of registreren, probeer het later opnieuw.',

		// user.service.js
		missingRequiredFields: 'Verplichte velden ontbreken',
		invalidCredentials: 'Ongeldige inloggegevens',
		loggedInSuccessfully: username => `Je bent succesvol ingelogd als ${username}`,
		usernameAlreadyExists: 'Gebruikersnaam bestaat al',
		usernameMustBeAtLeastThreeCharacters: 'Gebruikersnaam moet minimaal 3 tekens lang zijn',
		defaultProfilePicture: '/images/default.jpg',
		userCreatedSuccessfully: 'Gebruiker succesvol aangemaakt',
		userUpdatedSuccessfully: 'Gebruiker succesvol bijgewerkt',
		cannotAddYourself: 'Je kunt jezelf niet toevoegen',
		friendAddedSuccessfully: 'Vriend succesvol toegevoegd',
		notificationCreatedSuccessfully: 'Notificatie succesvol aangemaakt',
	},
};

module.exports = MESSAGE;