const express = require('express');
const { err } = require('../enums');
const itemsRouter = require('./items');
const krogerAPIRouter = require('./krogerAPI');
const listRouter = require('./list');
const listItemRouter = require('./listItem');
const sheetRouter = require('./sheet');
const storeRouter = require('./store');
const storeProductRouter = require('./storeProduct');
const userRouter = require('./user');

const mainRouter = express.Router();
mainRouter
	.use('/', krogerAPIRouter)
	.use('/', itemsRouter)
	.use('/', listRouter)
	.use('/', listItemRouter)
	.use('/', sheetRouter)
	.use('/', storeRouter)
	.use('/', storeProductRouter)
	.use('/', userRouter);

mainRouter
	.get('*', (req, res) => res
		.status(err.INVALID_ROUTE.status)
		.json({
			code: err.INVALID_ROUTE.code,
			messages: [`Invalid route: ${req.path}`],
		})
	);

module.exports = mainRouter;
