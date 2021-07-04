const { formatAndHandleError, handleError } = require('./utils/errorHandling');

module.exports = {
	ADD_ITEM_TO_LIST: {
		try: async ({ client, data }) => {
			const { listId } = data;
			const listItemResponse = await client.sheet.addItemToList(data);
			client.sheet.broadcast({
				type: 'ADDED_ITEM_TO_LIST',
				by: client.user.username,
				listId,
				data: listItemResponse,
			});
		},
		catch: ({ client, error }) => handleError({ client, errorEnum: error }),
	},
	UPDATE_ITEM_CHECKED: {
		try: async ({ client, data }) => {
			const { checked, itemId, listId } = data;
			const updateData = await client.sheet.updateItemChecked({
				checked,
				itemId,
				listId,
			});

			// Do nothing if no changes were made
			if (!updateData) return;

			client.sheet.broadcast({
				type: 'UPDATED_ITEM_CHECKED',
				by: client.user.username,
				checked,
				itemId,
				listId,
			});
		},
		catch: ({ client, error }) => formatAndHandleError({ client, error }),
	},
	UPDATE_ITEM_CLAIMED_BY: {
		try: async ({ client, data }) => {
			const { itemId, listId, userId } = data;
			const claimedByUserDocument = userId
				? client.user.document
				: undefined;

			const updateData = await client.sheet.updateItemClaimedBy({
				itemId,
				listId,
				claimedByUserDocument,
			});

			// Do nothing if no changes were made
			if (!updateData) return;

			client.sheet.broadcast({
				type: 'UPDATED_ITEM_CLAIMED_BY',
				claimedBy: updateData.id,
				itemId,
				listId,
			});
		},
		catch: ({ client, error }) => formatAndHandleError({ client, error }),
	},
	UPDATE_ITEM_QUANTITY: {
		try: async ({ client, data }) => {
			const { itemId, listId, quantity } = data;
			await client.sheet.updateItemQuantity({
				itemId,
				listId,
				quantity,
			});

			client.sheet.broadcast({
				type: 'UPDATED_ITEM_QUANTITY',
				by: client.user.username,
				itemId,
				listId,
				quantity,
			});
		},
		catch: ({ client, error }) => formatAndHandleError({ client, error }),
	},
};
