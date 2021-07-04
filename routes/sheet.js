const express = require('express'),
	sheetRouter = express.Router(),
	{ JsonError, validateRequest } = require('../functions'),
	{ User } = require('../models'),
	{ getListsBySheet } = require('../controllers/list'),
	{ getSheetById } = require('../controllers/sheet');


sheetRouter
	.get('/sheetDetails/:sheet_id', async (req, res) => {
		try {
			const sheetRes = await getSheetById(
				req.params.sheet_id,
				['store', 'store_products']
			);
			const { data, sheet } = sheetRes;

			const lists = await getListsBySheet(sheet, true);

			if (lists) data.lists = lists;
			return res.json(data);
		} catch (errorEnum) { return JsonError(res, errorEnum); }
	})
	.put('/newSheet', async (req, res) => {
		const paramSchema = {
			all: ['owner'],
			any: ['user_ids'],
		};

		if (validationError = validateRequest(req, res, paramSchema))
			return validationError;

		try {
			const user = await User.findOne({ username: req.body.owner });
			if (!user) throw 'USER_NOT_FOUND';

			const newSheet = new Sheet({ owner: user });

			await newSheet.save(err => {
				throw 'CREATE_SHEET';
			});
			return res.status(201).json({ id: newSheet._id })

		} catch (errorEnum) { return JsonError(res, errorEnum); }
	});

module.exports = sheetRouter;
