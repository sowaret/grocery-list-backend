const { model, Schema } = require('mongoose');

// Create ObjectId reference fields
const refModelNames =
	['ListItem', 'Product', 'Sheet', 'Store', 'StoreProduct', 'User'];
const refs = {};
refModelNames.map(model => {
	refs[model] = { ref: model, type: Schema.Types.ObjectId };
});

const modelFields = {
	Event: {
		timestamp: Number,
		item: refs.ListItem,
		key: Number,
		value: Number,
	},
	List: {
		sheet: refs.Sheet,
		name: String,
		list_items: [refs.ListItem],
	},
	ListItem: {
		checked: Boolean,
		claimedBy: refs.User,
		store_product: refs.StoreProduct,
		quantity: Number,
		sale_price: Number,
	},
	Product: {
		upc: String,
		name: String,
		brand: String,
		size: String,
	},
	Sheet: {
		code: String,
		password: String,
		owner: refs.User,
		users: [refs.User],
		store: refs.Store,
		store_products: [refs.StoreProduct],
	},
	Store: {
		store_id: Number, // Kroger's store ID
		name: String,
		chain: String,
		address: String,
		city: String,
		state: String,
		zipCode: String,
	},
	StoreProduct: {
		store: refs.Store,
		product: refs.Product,
		price: Number,
		aisle: Number,
	},
	User: {
		username: String,
		salt: String,
		password_hash: String,
		customColour: String,
		display_name: String,
	},
};

// Build models
const models = {};
for (const [name, fields] of Object.entries(modelFields)) {
	models[name] = model(name, fields);
}

module.exports = models;
