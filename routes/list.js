const express = require('express');
const listRouter = express.Router();
const { JsonError, validateRequest } = require('../functions');
const { List } = require('../models');
const {
	createList,
	getListById,
	getListsBySheet,
} = require('../controllers/list');
const {
	getSheetById,
	updateSheetStoreProductSort,
} = require('../controllers/sheet');

listRouter
	.get('/lists/:sheet_id', async (req, res) => {
		try {
			const sheetRes = await getSheetById(req.params.sheet_id),
				lists = await getListsBySheet(sheetRes.sheet);

			return lists
				? res.json(lists)
				: res.status(204).end();

		} catch (errorEnum) { JsonError(res, errorEnum); }
	})
	.post('/newList', async (req, res) => {
		const paramSchema = {
			all: ['sheet_id'],
			any: ['list_item_ids', 'name'],
		};

		if (validationError = validateRequest(req, res, paramSchema)) return validationError;

		try {
			const sheetRes = await getSheetById(req.body.sheet_id);
			const { sheet } = sheetRes;
			await createList({ name: req.body.name, sheet });
			return res.status(201).end();
		} catch (err) {
			return JsonError(res, 'CREATE_LIST');
		}
	})
	.patch('/renameList/:id', async (req, res) => {
		const paramSchema = {
			all: ['name'],
		};

		if (validationError = validateRequest(req, res, paramSchema))
			return validationError;

		try {
			const list = await getListById(req.params.id);

			list.name = req.body.name;
			await list.save();

			return res.status(204).end()

		} catch (errorEnum) { JsonError(res, errorEnum); }
	})
	.patch('/reorderSheetStoreProducts/:sheetId', async (req, res) => {
		const paramSchema = {
			all: ['oldIndex', 'newIndex', 'storeProductId'],
		};

		if (validationError = validateRequest(req, res, paramSchema))
			return validationError;

		try {
			const { sheetId } = req.params;
			const { oldIndex, newIndex, storeProductId } = req.body;
			await updateSheetStoreProductSort(
				sheetId,
				oldIndex,
				newIndex,
				storeProductId
			);

			return res.status(204).end()
		} catch(errorEnum) { return JsonError(res, errorEnum); }
	});

module.exports = listRouter;
