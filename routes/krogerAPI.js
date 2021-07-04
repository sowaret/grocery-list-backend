const express = require('express'),
	krogerAPIRouter = express.Router(),
	{ JsonError } = require('../functions'),
	krogerApi = require('../krogerApi');

krogerAPIRouter
	.get('/findStores/:zipCode', (req, res) => {
		krogerApi.get('/locations', {
			'filter.zipCode.near': req.params.zipCode,
			'filter.chain': 'KINGSOOPERS',
			'filter.limit': 5,
		}, {
			success: response => {
				const storeList = response.data.map(x => {
					const { locationId, name, chain } = x;
					const { addressLine1, city, state, zipCode } = x.address;

					return {
						name, chain, city, state, zipCode,
						store_id: locationId,
						address: addressLine1,
					};
				});

				return res.json(storeList);
			},
			fail: err => {
				const errorEnum = (err.response.data.error === 'invalid_token')
					? 'KROGER_INVALID_TOKEN'
					: 'KROGER_FIND_STORES';
				return JsonError(res, errorEnum);
			},
		});
	})
	.get('/findProducts/:storeId', (req, res) => {
		krogerApi.get('/products', {
			'filter.locationId': req.params.storeId,
			'filter.term': req.query.term,
			'filter.start': req.query.skip || 1,
			'filter.limit': req.query.limit || 20,
		}, {
			success: response => {
				const productList = response.data.map(x =>
				{
					// Handle missing product data
					const _aisle = x.aisleLocations,
						aisle = _aisle.length
							? {
								description: _aisle[0].description,
								number: _aisle[0].number,
							}
							: {},

						_price = x.items[0].price,
						price = _price
							? {
								regular: _price.regular,
								..._price.promo && {promo: _price.promo},
							}
							: {regular: null},
						{ description, upc, brand } = x,
						{ size } = x.items[0];

					return {
						upc,
						aisle,
						brand,
						name: description,
						price,
						size,
					};
				});

				return res.json(productList);
			},
			fail: err => {
				if (err.response.data.error === 'invalid_token')
					return JsonError(res, 'KROGER_INVALID_TOKEN');

				return JsonError(res, 'KROGER_FIND_PRODUCTS');
			},
		});
	});

module.exports = krogerAPIRouter;
