const express = require('express'),
	listItemRouter = express.Router(),
	{ JsonError, validateRequest } = require('../functions'),
	{ StoreProduct } = require('../models');

listItemRouter
	.put('/newListItem', async (req, res) => {
		const paramSchema = {
			all: ['store_product_id'],
			any: ['quantity', 'sale_price'],
		};

		if (validationError = validateRequest(req, res, paramSchema))
			return validationError;

		const { body } = req;

		try {
			const storeProduct = await StoreProduct.findOne({
				_id: body.store_product_id
			}, err => {
				throw 'FIND_PRODUCT';
			});
			if (!storeProduct) throw 'STORE_PRODUCT_NOT_FOUND';

			const newListItem = new ListItem({
				store_product: storeProduct,
				quantity: body.quantity || 0,
				...body.sale_price && { sale_price: body.sale_price },
			});

			await newListItem.save(err => {
				throw 'CREATE_LIST_ITEM';
			});
			return res.status(201).json({id: newListItem._id})
		} catch (errorEnum) { return JsonError(res, errorEnum); }
	});

module.exports = listItemRouter;
