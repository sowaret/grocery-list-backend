const { createUser, validateUserLogin } = require('../../controllers/user');
const { send } = require('../../functions');
const { handleError } = require('./utils/errorHandling');

const processUserConnect = async ({ App, client, data, type }) => {
	const controller = type === 'REGISTERED_USER'
		? createUser
		: validateUserLogin;
	const userDocument = await controller(data);

	const { _id, username } = userDocument;
	const cookie = App.addAuthClient({ client, userDocument });

	send(client, {
		type,
		cookie,
		user: { _id, username },
	});
};

module.exports = {
	LOG_IN_USER: {
		try: async ({ App, client, data }) => {
			await processUserConnect({
				App,
				client,
				data,
				type: 'LOGGED_IN_USER',
			});
		},
		catch: ({ client, error }) => handleError({ client, ...error }), // culprit
	},
	RECONNECT_USER: {
		try: async ({ App, client, data }) => {
			const { _id: id, cookie } = data;
			App.reconnectAuthClient({ client, cookie, id });
		},
		catch: ({ client, error }) => {
			if (error !== 'invalid cookie') return;
			send(client, { type: 'INVALIDATE_LOGIN_COOKIE' });
		},
	},
	REGISTER_USER: {
		try: async ({ App, client, data }) => {
			await processUserConnect({
				App,
				client,
				data,
				type: 'REGISTERED_USER',
			});
		},
		catch: ({ client, error }) => handleError({ client, ...error }), // culprit
	},
};
