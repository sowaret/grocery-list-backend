const { formatAndHandleError } = require('./utils/errorHandling');

module.exports = {
	CHANGE_STORE: {
		try: async ({ client, data }) => {
			const store = await client.sheet.changeStore(data);
			client.sheet.broadcast({
				type: 'CHANGED_STORE',
				by: client.user.username,
				store,
			});
		},
		catch: ({ client, error }) => formatAndHandleError({ client, error }),
	},
};
