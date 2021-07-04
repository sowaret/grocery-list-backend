const arrayMove = require('array-move');
const { generateRandomCode } = require('../functions');
const { Sheet, Store } = require('../models');
const { hash } = require('../utils/salter');
const { generateSheetCode, populateSheetDetails } = require('./utils/sheet');
const { createStore, getStoreById } = require('./store');

const validateChangeStoreRequirements = async ({ sheetId, storeDetails }) => {
	// Make sure sheet exists
	const { sheet } = await getSheetById(sheetId);
	if (!sheet) throw 'SHEET_NOT_FOUND';

	// Find or create store by Kroger ID
	const { store_id } = storeDetails;
	const store = await getStoreById(store_id);
	if (store) return { sheet, store };

	// Create store if it doesn't exist
	const newStore = await createStore(storeDetails);
	return { sheet, store: newStore };
};

const validatePasswordChange = async ({
	confirmPassword,
	newPassword,
	oldPassword,
	sheetId,
}) => {
	if (newPassword !== confirmPassword) throw 'CONFIRM_PASSWORD_DOESNT_MATCH';
	if (!oldPassword.length || !newPassword.length)
		throw 'PASSWORD_CANNOT_BE_EMPTY';

	const { sheet } = await getSheetById(sheetId);
	const { passwordHash } = hash(oldPassword, '');
	if (passwordHash !== sheet.password) throw 'OLD_PASSWORD_INCORRECT';

	return sheet;
};

// Exports
const addNewUserToSheet = async ({ sheetDocument, userDocument }) => {
	const userIds = sheetDocument.users.map(x => x._id.toString());
	// Do nothing if this user has already been added in the database
	if (sheetDocument.users.some(x => x._id.toString() === userDocument.id))
		return;

	sheetDocument.users.push(userDocument);
	await sheetDocument.save().catch(err => {
		throw 'ADD_USER_TO_SHEET';
	});

	return true;
};

const changeSheetPassword = async params => {
	try {
		const sheet = await validatePasswordChange(params);
		const { newPassword } = params;
		sheet.password = hash(newPassword, '').passwordHash;
		await sheet.save().catch(err => {
			throw 'CHANGE_SHEET_PASSWORD';
		});
	} catch (error) {
		throw { method: 'changeSheetPassword', error };
	}
};

const changeSheetStore = async ({ sheetId, storeDetails }) => {
	const { sheet, store } =
		await validateChangeStoreRequirements({ sheetId, storeDetails, });
	sheet.store = store;
	await sheet.save().catch(err => {
		throw 'CHANGE_STORE';
	});

	const { name, store_id: id } = store;
	return { id, name };
};

const createSheet = async ({ owner }) => {
	try {
		const generatedPassword = generateRandomCode(8, true);
		const password = hash(generatedPassword, '').passwordHash;
		const newSheet = new Sheet({
			code: await generateSheetCode(),
			owner,
			password,
		});
		await newSheet.save().catch(err => {
			throw 'CREATE_SHEET';
		});
		return { document: newSheet, password: generatedPassword };
	} catch (error) {
		throw { method: 'createSheet', error };
	}
};

const getSheetByCode = (code, populateFields = []) => getSheetByField(
	{ code: code.toUpperCase() },
	populateFields,
	'getSheetByCode'
);

const getSheetByField = async (filter, populateFields = [], method) => {
	// Convert any `populateFields` string to array
	if (typeof populateFields === 'string') populateFields = [populateFields];
	try {
		// Validate parameters
		if (
			typeof filter !== 'object'
			|| !Array.isArray(populateFields)
		) throw 'INVALID_PARAMETER_IN_CONTROLLER';

		return await populateSheetDetails(filter, populateFields);
	} catch (error) {
		throw { method, error };
	}
};

/*
{
	sheet: models.Sheet,
	[data]: {
		storeId: sheet.store.store_id,
		storeName: sheet.store.name,
		storeProducts: sheet.store_products,
	}
}
*/
const getSheetById = (sheetId, populateFields = []) =>
	getSheetByField({ _id: sheetId }, populateFields, 'getSheetById');

const updateSheetStoreProductSort = async (
	sheetId,
	oldIndex,
	newIndex,
	storeProductId
) => {
	try {
		const sheet = sheetId instanceof Sheet
			? sheetId
			: ( await getSheetById(sheetId) ).sheet;
		const storeProducts = [...sheet.store_products];

		// Ensure we are trying to move the correct item
		if (storeProducts[oldIndex]._id.toString() !== storeProductId)
			throw 'MISMATCH_STORE_PRODUCT';

		sheet.store_products = arrayMove(storeProducts, oldIndex, newIndex);
		await sheet.save().catch(err => {
			throw 'UPDATE_SHEET_STORE_PRODUCT_SORT';
		})
	} catch(error) {
		throw { method: 'updateSheetStoreProductSort', error };
	}
}; // updateSheetStoreProductSort

module.exports = {
	addNewUserToSheet,
	changeSheetPassword,
	changeSheetStore,
	createSheet,
	getSheetByCode,
	getSheetById,
	updateSheetStoreProductSort,
};
