const express = require('express'),
	storeProductRouter = express.Router(),
	{ JsonError, validateRequest } = require('../functions'),
	{ Product, Store } = require('../models');

storeProductRouter
	.put('/newStoreProduct', async (req, res) => {
		const paramSchema = {
			all: ['store_id', 'product_id', 'price', 'aisle'],
		};

		if (validationError = validateRequest(req, res, paramSchema))
			return validationError;

		const { body } = req;

		try {
			// Find store
			const store = await Store.findOne({ _id: body.store_id }, err => {
				throw 'FIND_STORE';
			});
			if (!store) throw 'STORE_NOT_FOUND';

			const product = await Product.findOne({ _id: body.product_id }, err => {
				throw 'FIND_PRODUCT';
			});
			if (!product) throw 'PRODUCT_NOT_FOUND';

			const { price, aisle } = body;
			const newStoreProduct = new StoreProduct({ store, product, price, aisle });
			await newStoreProduct.save(err => {
				throw 'CREATE_STORE_PRODUCT';
			});
			
			return res.status(201).json({ id: newStoreProduct._id })

		} catch (errorEnum) { JsonError(res, errorEnum); }
	});

module.exports = storeProductRouter;
