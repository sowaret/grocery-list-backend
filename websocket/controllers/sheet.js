const { changeSheetPassword } = require('../../controllers/sheet');
const { send } = require('../../functions');
const { formatAndHandleError, handleError } = require('./utils/errorHandling');

const populateSheet = ({ client, password, wsSheet }) => {
	const { code, lists, store, storeProducts, ...sheet } = wsSheet;
	send(client, {
		type: 'POPULATE_SHEET',
		code,
		lists,
		...password && { password },
		sheetId: wsSheet.id,
		store,
		storeProducts,
		users: wsSheet.getUserList(),
	});
};

module.exports = {
	CHANGE_SHEET_PASSWORD: {
		try: async ({ client, data }) => {
			await changeSheetPassword({...data, sheetId: client.sheet.id });
			send(client, { type: 'CHANGED_SHEET_PASSWORD' });
		},
		catch: ({ client, error }) => formatAndHandleError({
			client,
			culprit: 'SheetDetailsModal',
			error,
		}),
	},
	CREATE_SHEET: {
		try: async ({ App, client, data }) => {
			const { password, wsSheet } = await App.createSheetDocument(client);
			client.sheet = wsSheet;
			populateSheet({ client, password, wsSheet });
		},
		catch: ({ client, error }) => handleError({
			client,
			culprit: 'JoinSheetModal',
			...error,
		}),
	},
	JOIN_SHEET: {
		try: async ({ App, client, data }) => {
			const { password, sheetCode } = data;
			const wsSheet = await App.validateSheetJoin({
				client,
				password,
				sheetCode,
			});

			// Let all clients know this user joined
			const { id, customColour, username } = client.user;
			client.sheet.broadcast({
				fromUser: client.user,
				type: 'USER_JOINED',
				user: { id, customColour, username },
			});

			// Tell connecting client the sheet's state
			populateSheet({ client, wsSheet });
		},
		catch: ({ client, error }) => formatAndHandleError({
			client,
			culprit: 'JoinSheetModal',
			error,
		}),
	},
	REORDER_STORE_PRODUCTS: {
		try: async ({ App, client, data }) => {
			const { newIndex, oldIndex, storeProductId } = data;
			await client.sheet.updateSort({
				newIndex,
				oldIndex,
				storeProductId,
			});

			client.sheet.broadcast({
				type: 'REORDERED_STORE_PRODUCTS',
				by: client.username,
				newIndex,
				oldIndex,
				storeProductId,
			});
		},
		catch: ({ client, error }) => formatAndHandleError({ client, error }),
	},
};
