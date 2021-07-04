const { List, ListItem, StoreProduct } = require('../models');
const { getListById } = require('./list');
const { getOrCreateProduct } = require('./product');
const {
	addStoreProductToSheet,
	getOrCreateStoreProduct,
} = require('./storeProduct');

const addItemToList = async ({ item, listId }) => {
	const populateSheetFields = ['store', 'store_products'];
	const list = await getListById(listId, ['list_items'], populateSheetFields);
	const { product } = await getOrCreateProduct(item);
	const { store } = list.sheet;
	const storeProductDetails = {
		price: item.price.regular,
		aisle: item.aisle.number,
	};
	const { storeProduct } = await getOrCreateStoreProduct(
		store,
		product,
		storeProductDetails
	);
	const listItemResponse = await getOrCreateListItem(
		list,
		storeProduct,
		item
	);
	// Check whether sheet needs this StoreProduct
	const storeProductExists = await addStoreProductToSheet(
		storeProduct,
		list,
		listItemResponse
	);

	return { listItemResponse, storeProduct, storeProductExists };
};

const getListItemById = async _id => {
	const listItem = await ListItem.findOne({ _id }).catch(err => {
		throw 'FIND_LIST_ITEM';
	});
	if (listItem) return listItem;
	throw 'LIST_ITEM_NOT_FOUND';
};

const getOrCreateListItem = async (list, storeProduct, _options) => {
	// Validate parameters
	if (
		!(list instanceof List)
		|| !(storeProduct instanceof StoreProduct)
		|| typeof(_options) !== 'object'
	)
		throw 'INVALID_PARAMETER_IN_CONTROLLER';

	// Build options
	const promoPrice = _options.price.promo;
	const options = {
		quantity: 1,
		...promoPrice && {sale_price: promoPrice},
	};

	// Return the list item if it already exists
	const listItem = list.list_items.find(
		x => x.store_product.toString() === storeProduct.id
	);
	if (listItem) return { exists: true, listItem };

	// Create ListItem
	const newListItem = await new ListItem({
		store_product: storeProduct,
		...options,
	}).save().catch(err => {
		throw 'CREATE_LISTITEM';
	});

	list.list_items.push(newListItem);
	await list.save().catch(err => {
		throw 'PUSH_LIST_ITEM';
	});

	return { listItem: newListItem };

}; // getOrCreateListItem

const updateListItemField = async (listItem, fieldName, value, enumIfError) => {
	listItem[fieldName] = value;
	await listItem.save().catch(err => {
		throw enumIfError;
	});
	return { updated: true };
}; // updateListItemField

const updateListItemChecked = async ({ checked, itemId }) => {
	const listItem = await getListItemById(itemId);
	if (listItem.checked === checked) return;

	await updateListItemField(
		listItem,
		'checked',
		checked,
		'UPDATE_LIST_ITEM_CHECKED'
	);
	return { updated: true };
};

const updateListItemClaimedBy = async (listItemId, claimedByUserDocument) => {
	const listItem = await getListItemById(listItemId);
	if (listItem.claimedBy === claimedByUserDocument) return;

	await updateListItemField(
		listItem,
		'claimedBy',
		claimedByUserDocument,
		'UPDATE_LIST_ITEM_CLAIMED_BY'
	);

	return { id: claimedByUserDocument ? claimedByUserDocument.id : null };
}; // updateListItemClaimedBy

const updateListItemQuantity = async (listItemId, quantity) => {
	const listItem = await getListItemById(listItemId);
	if (quantity === listItem.quantity) return;

	return await updateListItemField(
		listItem,
		'quantity',
		quantity,
		'UPDATE_LIST_ITEM_QUANTITY'
	);
}; // updateListItemQuantity

module.exports = {
	addItemToList,
	getOrCreateListItem,
	updateListItemChecked,
	updateListItemClaimedBy,
	updateListItemQuantity,
};
