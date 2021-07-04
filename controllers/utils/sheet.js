const { isObjectIdValid } = require('./validators');
const { err: ERROR } = require('../../enums');
const { generateRandomCode } = require('../../functions');
const { Sheet } = require('../../models');

const generateSheetCode = async _ => {
	const code = generateRandomCode(4);
	const sheet = await Sheet.findOne({ code });
	// Retry if this code is already in use
	if (sheet) return await generateSheetCode();
	return code;
};

const populateStoreFields = ({ sheet, response }) => {
	if (!sheet.store) return { id: null, name: null };
	if (!response.data) response.data = {};

	const { name, store_id: id } = sheet.store;
	response.data.store = { id, name };
};

const populateStoreProducts = ({ sheet, response }) => {
	if (!response.data) response.data = {};

	const storeProducts = {};
	sheet.store_products.forEach(sp => {
		storeProducts[sp._id] = {
			productId: sp.product._id,
			name: sp.product.name,
			price: sp.price,
			aisle: sp.aisle,
		};
	});

	response.data.storeProducts = storeProducts;
};

const populateUsers = ({ sheet, response }) => {
	if (!response.data) response.data = {};

	response.data.users = sheet.users.map(user => {
		const { _id, customColour, username } = user;
		return { customColour, id: _id.toString(), username };
	});
};

const populateSheetDetails = async (filter, populateFields) => {
	const query = Sheet.findOne(filter);

	if (populateFields.includes('store')) query.populate('store');
	if (populateFields.includes('store_products')) {
		query.populate({
			path: 'store_products',
			populate: { path: 'product' },
		});
	}
	if (populateFields.includes('users')) query.populate('users');

	try {
		const sheet = await query.exec();
		if (!sheet) throw 'SHEET_NOT_FOUND';

		const response = { sheet };
		if (populateFields.includes('store'))
			populateStoreFields({ sheet, response });

		if (populateFields.includes('store_products'))
			populateStoreProducts({ sheet, response });

		if (populateFields.includes('users'))
			populateUsers({ sheet, response });

		return response;
	} catch (err) {
		if (err in ERROR) throw err;
		throw 'FIND_SHEET';
	}
};

module.exports = {
	generateSheetCode,
	populateSheetDetails,
};
