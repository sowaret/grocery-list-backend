const { Product, Store, StoreProduct } = require('../models');

const addStoreProductToSheet = async (storeProduct, list, listItemResponse) => {
	// Return: storeProduct will already exist if ListItem exists
	if (listItemResponse.exists) return true;

	// Return if storeProduct ID is already in list
	const storeProductIds = list.sheet.store_products.map(x => x._id);
	if (storeProductIds.includes(storeProduct._id)) return true;

	// Push storeProduct to sheet if it doesn't exist
	list.sheet.store_products.push(storeProduct);
	await list.sheet.save().catch(err => {
		throw 'ADD_SHEET_STORE_PRODUCT';
	});
}; // addStoreProductToSheet

const getOrCreateStoreProduct = async (store, product, details = {}) => {
	if (
		!(store instanceof Store)
		|| !(product instanceof Product)
		|| typeof details !== 'object'
	)
		throw 'INVALID_PARAMETER_IN_CONTROLLER';

	const storeProduct = await StoreProduct.findOne({ store, product })
		.catch(err => {
			throw 'FIND_STORE_PRODUCT';
		});
	if (storeProduct) return { storeProduct };

	const newStoreProduct = await new StoreProduct({
		store,
		product,
		...details,
	}).save().catch(err => {
		throw 'CREATE_STORE_PRODUCT';
	});

	return { storeProduct: newStoreProduct, new: true }
}; // getOrCreateStoreProduct

module.exports = { addStoreProductToSheet, getOrCreateStoreProduct };
