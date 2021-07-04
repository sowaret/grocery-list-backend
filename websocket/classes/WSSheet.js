const arrayMove = require('array-move');
const {
	createList,
	getListsBySheet,
	renameList,
} = require('../../controllers/list');
const {
	addItemToList,
	updateListItemChecked,
	updateListItemClaimedBy,
	updateListItemQuantity,
} = require('../../controllers/listItem');
const {
	addNewUserToSheet,
	changeSheetStore,
	getSheetById,
	updateSheetStoreProductSort,
} = require('../../controllers/sheet');
const { send } = require('../../functions');
const { hash } = require('../../utils/salter');
const WSUser = require('./WSUser');

const formatUser = (wsSheet, user, rest = {}) => {
	const { customColour, id, username } = user;
	const isOwner = id === wsSheet.ownerId;
	return {
		customColour,
		id,
		username,
		...isOwner && { isOwner },
		...rest,
	};
};

class WSSheet {
	constructor(sheetId) {
		this.id = sheetId;
		this.wsUsers = {};
	}

	// User methods
	disconnectUser(client) {
		const { id, sheet, user } = client;
		sheet.broadcast({ type: 'USER_LEFT', id: user.id });
		delete this.wsUsers[id];
	}

	async joinUser(wsUser) {
		const { client, document: userDocument } = wsUser;
		const userIsNew = await addNewUserToSheet({
			sheetDocument: this.document,
			userDocument,
		});

		if (userIsNew) this.users.push(formatUser(this, userDocument));
		this.wsUsers[wsUser.client.id] = wsUser;
	}

	getUserList() {
		const connectedClientIds = Object.values(this.wsUsers).map(
			user => user.id
		);
		const users = {};
		this.users.map(user => {
			const isConnected = connectedClientIds.includes(user.id);
			users[user.id] = formatUser(this, user, {
				...!isConnected && { isDisconnected: true },
			});
		});
		return users;
	}

	// WebSocket methods
	broadcast(_data) {
		// `fromUser` skips broadcast for sender
		const { fromUser, ...data } = _data;
		Object.values(this.wsUsers)
			.filter(user => user !== fromUser)
			.forEach(user => user.send(data));
	}

	// Helper methods
	async enrichWithSheetDetails() {
		const { data, sheet } = await getSheetById(
			this.id,
			['store', 'store_products', 'users']
		);

		this.document = sheet;
		this.ownerId = sheet.owner._id.toString();

		const lists = await getListsBySheet(sheet, true);
		if (lists) data.lists = lists;

		this.code = sheet.code;
		for (const key in data) {
			this[key] = data[key];
		}
	}

	// Methods acting upon the sheet
	async addItemToList({ item, listId }) {
		const { listItemResponse, storeProduct, storeProductExists } =
			await addItemToList({ item, listId });

		const { exists, listItem } = listItemResponse;
		if (!exists) {
			this.lists[listId].items[listItem._id] = {
				storeProductId: storeProduct._id,
				quantity: listItem.quantity,
				salePrice: listItem.sale_price,
			};
		}
		if (storeProductExists) listItemResponse.storeProductExists = true;
		else {
			const { aisle, price } = storeProduct;
			const { _id, name } = storeProduct.product;
			this.storeProducts[storeProduct._id] = {
				aisle,
				name,
				price,
				productId: _id,
			};
		}

		return listItemResponse;
	}

	async changeStore(storeDetails) {
		const store = await changeSheetStore(storeDetails);
		this.store = store;
		return store;
	}

	async createList(name) {
		const newList = await createList({ name, sheet: this.document });
		this.lists = {
			...this.lists,
			[newList._id]: { name, items: {} },
		};
		return newList._id;
	}

	async renameList(listId, newName) {
		await renameList(listId, newName);
		this.lists[listId].name = newName;
	}

	async updateItemChecked({ checked, itemId, listId }) {
		const updateData = await updateListItemChecked({ checked, itemId });
		if (updateData) this.lists[listId].items[itemId].checked = checked;
		return updateData;
	}

	async updateItemClaimedBy({ itemId, listId, claimedByUserDocument }) {
		const updateData =
			await updateListItemClaimedBy(itemId, claimedByUserDocument);
		if (updateData)
			this.lists[listId].items[itemId].claimedBy = updateData.id;
		return updateData;
	}

	async updateItemQuantity({ itemId, listId, quantity }) {
		await updateListItemQuantity(itemId, quantity);
		this.lists[listId].items[itemId].quantity = quantity;
	}

	async updateSort({ newIndex, oldIndex, storeProductId }) {
		await updateSheetStoreProductSort(
			this.id,
			oldIndex,
			newIndex,
			storeProductId
		);
		this.storeProducts = Object.fromEntries(arrayMove(
			Object.entries(this.storeProducts),
			oldIndex,
			newIndex
		));
	}

	addItem() {

	}

	addStoreProduct() {

	}
}

module.exports = WSSheet;
