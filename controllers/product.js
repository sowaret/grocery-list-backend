const { Product } = require('../models');

const getOrCreateProduct = async productDetails => {
	if (typeof(productDetails) !== 'object')
		throw 'INVALID_PARAMETER_IN_CONTROLLER';

	const product = await Product.findOne({ upc: productDetails.upc })
		.catch(err => {
			throw 'CREATE_PRODUCT';
		});
	if (product) return { product };

	const newProduct = await new Product(productDetails).save().catch(err => {
		throw 'CREATE_PRODUCT';
	});
	return { product: newProduct, new: true };
}; // getOrCreateProduct

module.exports = { getOrCreateProduct };
