const { Store } = require('../models');
const { isObjectIdValid } = require('./utils/validators');

const createStore = details =>
	new Store(details).save().catch(err => {
		throw 'CREATE_STORE';
	});

const getStoreById = async store_id =>
	Store.findOne({ store_id }).catch(err => {
		throw 'FIND_STORE';
	});

module.exports = { createStore, getStoreById };
