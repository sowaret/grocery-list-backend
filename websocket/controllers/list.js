const { handleError } = require('./utils/errorHandling');

module.exports = {
	CREATE_LIST: {
		try: async ({ client, data }) => {
			const { name } = data;
			const listId = await client.sheet.createList(name);
			client.sheet.broadcast({
				type: 'CREATED_LIST',
				by: client.user.username,
				list: { [listId]: { name, items: {} } },
			});
		},
		catch: ({ client, error }) => handleError({ client, errorEnum: error }),
	},
	RENAME_LIST: {
		try: async ({ client, data }) => {
			const { listId, newName } = data;
			await client.sheet.renameList(listId, newName);
			// Notify all clients of successful rename
			client.sheet.broadcast({
				type: 'RENAMED_LIST',
				by: client.username,
				listId,
				newName,
			});
		},
		catch: ({ client, error }) => handleError({ client, errorEnum: error }),
	},
};
