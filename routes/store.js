const express = require('express'),
	storeRouter = express.Router(),
	{ JsonError, validateRequest } = require('../functions'),
	{ Store } = require('../models');

storeRouter
	.put('/newStore', async (req, res) => {
		const paramSchema = {
			any: ['name'],
		};

		if (validationError = validateRequest(req, res, paramSchema))
			return validationError;

		try {
			const newStore = new Store({
				name: req.body.name || '',
			});
			await newStore.save(err => {
				throw 'CREATE_STORE';
			});

			return res.status(201).json({ id: newStore._id });
		} catch (errorEnum) {
			return JsonError(res, errorEnum);
		}
	})
	.put('/changeStore', async (req, res) => {
		const paramSchema = {
			all: ['sheet_id', 'store_id'],
			any: ['name', 'chain', 'address', 'city', 'state', 'zipCode'],
		};

		if (validationError = validateRequest(req, res, paramSchema))
			return validationError;

		try {
			const required = await validateChangeStoreRequirements(req.body);
			required.sheet.store = required.store;
			await required.sheet.save(err => {
				throw 'CHANGE_STORE';
			});

			return res.json({
				id: required.store.id,
				name: required.store.name,
			});
		} catch (errorEnum) {
			return JsonError(res, errorEnum);
		}
	});

module.exports = storeRouter;
