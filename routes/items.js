const express = require('express'),
	itemRouter = express.Router(),
	{ JsonError, validateRequest } = require('../functions'),
	{ getListById } = require('../controllers/list'),
	{ getOrCreateListItem, updateListItemQuantity } = require('../controllers/listItem'),
	{ getOrCreateProduct } = require('../controllers/product'),
	{ addStoreProductToSheet, getOrCreateStoreProduct } = require('../controllers/storeProduct');

itemRouter
	.put('/addItemToList/:list_id', async (req, res) => {

		// `store` to find storeProduct
		// `store_products` to add storeProduct to the sheet if it doesn't already exist
		const populateSheetFields = ['store', 'store_products'];

		try {
			const list = await getListById(req.params.list_id,
				['list_items'], populateSheetFields);
			const productRes = await getOrCreateProduct(req.body);

			const { product } = productRes;
			const { store } = list.sheet;
			const storeProductDetails = {
				price: req.body.price.regular,
				aisle: req.body.aisle.number,
			};

			const { storeProduct } = await getOrCreateStoreProduct(store,
				product, storeProductDetails);
			const listItemResponse = await getOrCreateListItem(list,
				storeProduct, req.body);

			// Check whether sheet needs this StoreProduct
			const storeProductExists = await addStoreProductToSheet(storeProduct,
				list, listItemResponse);

			if (storeProductExists) listItemResponse.storeProductExists = true;

			return res.status(201).json(listItemResponse);

		} catch(errorEnum) { JsonError(res, errorEnum); }
	})
	.patch('/updateItemQuantity/:listItemId', async (req, res) => {
		const paramSchema = {
			all: ['quantity'],
		};

		if (validationError = validateRequest(req, res, paramSchema)) return validationError;

		try {
			const result = await updateListItemQuantity(req.params.listItemId,
				req.body.quantity);

			return result
				? res.status(201).json(result)
				: res.status(201).end();

		} catch (errorEnum) { JsonError(res, error_enum); }
	});

module.exports = itemRouter;
