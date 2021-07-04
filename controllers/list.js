const { List, Sheet } = require('../models');
const { isObjectIdValid } = require('./utils/validators');

const formatListItems = listItems => {
	const formattedItems = {};

	listItems.forEach(item => {
		const { _id, checked, claimedBy, store_product, quantity, sale_price } = item;
		formattedItems[_id] = {
			checked,
			...claimedBy && { claimedBy },
			storeProductId: store_product.id,
			quantity,
			...sale_price && { salePrice: sale_price },

		};
	});

	return formattedItems;
};

const formatLists = (_lists, populate) => {
	const lists = {};
	_lists.forEach(list => {
		lists[list._id] = {
			name: list.name,
			...populate && { items: formatListItems(list.list_items) },
		};
	});

	return lists;
};

const populateListItems = query => {
	query.populate({
		path: 'list_items',
		select: ['checked', 'claimedBy', 'quantity', 'sale_price'],
		populate: {
			path: 'store_product',
			select: 'price',
			populate: {
				path: 'product',
				select: ['name', 'upc'],
			},
		},
	});
};

// Exports
const createList = async ({ name, sheet }) => {
	const newList = await new List({
		name: name.trim() || formatCurrentDate(),
		sheet,
	}).save().catch(err => {
		throw 'CREATE_LIST';
	});

	return newList;
};

const getListById = async (listId, populateFields = [], populateSheetFields = []) => {
	// Convert any `populateFields` string to array
	if (typeof(populateFields) === 'string')
		populateFields = [populateFields];

	// Convert any `populateSheetFields` string to array
	if (typeof(populateSheetFields) === 'string')
		populateSheetFields = [populateSheetFields];

	if (
		typeof(listId) !== 'string'
		|| !Array.isArray(populateFields)
		|| !Array.isArray(populateSheetFields)
	)
		throw 'INVALID_PARAMETER_IN_CONTROLLER';

	const query = List.findOne({ _id: listId });

	for (path of populateFields) query.populate({ path });
	for (path of populateSheetFields) {
		query.populate({
			path: 'sheet',
			populate: { path },
		});
	}

	const list = await query.exec().catch(err => {
		throw 'FIND_LIST';
	});
	if (list) return list;

	throw 'LIST_NOT_FOUND';

}; // getListById

const getListsBySheet = async (sheet, shouldPopulateListItems = false) => {
	if (!(sheet instanceof Sheet)) throw 'INVALID_PARAMETER_IN_CONTROLLER';

	const query = List.find({ sheet });
	if (shouldPopulateListItems) populateListItems(query);

	const _lists = await query.exec().catch(err => {
		throw 'FIND_LISTS';
	});
	if (_lists.length) return formatLists(_lists, shouldPopulateListItems);
};

const renameList = async (listId, newName) => {
	if (!isObjectIdValid(listId))
		throw 'INVALID_LIST_ID';
	if (typeof newName !== 'string' || !newName.length)
		throw 'NAME_MUST_BE_STRING';

	const list = await getListById(listId);
	list.name = newName;
	await list.save().catch(err => {
		throw 'RENAME_LIST';
	});
};

module.exports = { createList, getListById, getListsBySheet, renameList };
