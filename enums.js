module.exports = Object.freeze({
	err: {
		CREATE_USER: { code: 1, message: 'Error creating user', status: 500 },
		USER_ALREADY_EXISTS: { code: 2, message: 'User already exists', status: 409 },
		REQUEST_IS_EMPTY: { code: 3, message: 'Request cannot be empty', status: 400 },
		REQUIRED_FIELD_MISSING: { code: 4, message: 'Required field is missing', status: 400 },
		USER_NOT_FOUND: { code: 5, message: 'User not found', status: 404 },
		CREATE_LIST: { code: 6, message: 'Error creating list', status: 500 },
		CREATE_PRODUCT: { code: 7, message: 'Error creating product', status: 500 },
		CREATE_LIST_ITEM: { code: 8, message: 'Error creating list item', status: 500 },
		FIND_PRODUCT: { code: 9, message: 'Error finding product', status: 500 },
		PRODUCT_NOT_FOUND: { code: 10, message: 'Product not found', status: 404 },
		MUTUALLY_EXCLUSIVE_FIELDS: { code: 11, message: 'Fields are mutually-exclusive', status: 400 },
		CREATE_SHEET: { code: 12, message: 'Error creating sheet', status: 500 },
		SHEET_NOT_FOUND: { code: 13, message: 'Sheet not found', status: 404 },
		CREATE_STORE: { code: 14, message: 'Error creating store', status: 500 },
		FIND_STORE: { code: 15, message: 'Error finding store', status: 500 },
		STORE_NOT_FOUND: { code: 16, message: 'Store not found', status: 404 },
		CREATE_STORE_PRODUCT: { code: 17, message: 'Error creating store product', status: 500 },
		STORE_PRODUCT_NOT_FOUND: { code: 18, message: 'Store product not found', status: 404 },
		FIND_SHEET: { code: 19, message: 'Error finding sheet', status: 500 },
		FIND_LISTS: { code: 20, message: 'Error finding lists', status: 500 },
		INVALID_ROUTE: { code: 21, message: 'Invalid route', status: 404 },
		LIST_NOT_FOUND: { code: 22, message: 'List not found', status: 404 },
		FIND_LIST: { code: 23, message: 'Error finding list', status: 500 },
		KROGER_FIND_STORES: { code: 24, message: 'Kroger: Error finding stores', status: 500 },
		KROGER_INVALID_TOKEN: { code: 25, message: 'Kroger: Invalid token', status: 401 },
		CHANGE_STORE: { code: 26, message: 'Error changing store', status: 500 },
		KROGER_FIND_PRODUCTS: { code: 27, message: 'Kroger: Error finding products', status: 500 },
		PUSH_LIST_ITEM: { code: 28, message: 'Error adding item to list', status: 500 },
		FIND_STORE_PRODUCT: { code: 29, message: 'Error finding store product', status: 500 },
		INVALID_PARAMETER_IN_CONTROLLER: { code: 30, message: 'Invalid parameter', status: 500 },
		FIND_LIST_ITEM: { code: 31, message: 'Error finding list item', status: 500 },
		LIST_ITEM_NOT_FOUND: { code: 32, message: 'List item not found', status: 404 },
		UPDATE_LIST_ITEM_QUANTITY: { code: 33, message: 'Error updating list item quantity', status: 500 },
		UPDATE_SHEET_STORE_PRODUCT_SORT: { code: 34, message: 'Error updating sheet store product sort', status: 500 },
		MISMATCH_STORE_PRODUCT: { code: 35, message: 'Store product in list does not match', status: 409 },
		INVALID_SHEET_ID: { code: 36, message: 'Invalid sheet ID', status: 400 },
		RENAME_LIST: { code: 37, message: 'Error renaming list', status: 500 },
		INVALID_LIST_ID: { code: 38, message: 'Invalid list ID', status: 400 },
		SHEET_ID_REQUIRED: { code: 39, message: 'Sheet ID is required', status: 400 },
		NAME_MUST_BE_STRING: { code: 40, message: 'Name must be a non-empty string', status: 400 },
		CONFIRM_PASSWORD_DOESNT_MATCH: {
			code: 41,
			message: 'Password and confirm password do not match',
			status: 400,
		},
		VALIDATE_USER_LOGIN: {
			code: 42,
			message: 'Error validating user login',
			status: 500,
		},
		USERNAME_PASSWORD_INCORRECT: {
			code: 43,
			message: 'Username or password is incorrect',
			status: 401,
		},
		SHEET_PASSWORD_INCORRECT: {
			code: 44,
			message: 'Password is incorrect',
			status: 401,
		},
		PASSWORD_CANNOT_BE_EMPTY: {
			code: 45,
			message: 'Password cannot be empty',
			status: 409,
		},
		CHANGE_SHEET_PASSWORD: {
			code: 46,
			message: 'Error changing password',
			status: 500,
		},
		OLD_PASSWORD_INCORRECT: {
			code: 47,
			message: 'Old password is incorrect',
			status: 401,
		},
		ADD_USER_TO_SHEET: {
			code: 48,
			message: 'Error adding user to sheet',
			status: 500,
		},
		UPDATE_LIST_ITEM_CLAIMED_BY: {
			code: 49,
			message: 'Error updating list item claimant',
			status: 500,
		},
	},
});