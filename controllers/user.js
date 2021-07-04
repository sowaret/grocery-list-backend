const { err: ERROR } = require('../enums');
const { User } = require('../models');
const salter = require('../utils/salter');

const handleError = (err, otherwise) => {
	if (Object.keys(ERROR).includes(err)) throw err;
	throw otherwise;
};

const validateUsernameAndPassword = ({ password, username }) => {
	// If these parameters are not strings
	if ([username, password].some(x => typeof x !== 'string'))
		throw 'INVALID_PARAMETER_IN_CONTROLLER';
};

const findUserByUsername = (username, errorEnum) =>
	User.findOne({ username }).catch(err => {
		throw errorEnum;
	});

const createUser = async ({ confirmPassword, password, username }) => {
	try {
		validateUsernameAndPassword({ password, username });
		if (password !== confirmPassword)
			throw 'CONFIRM_PASSWORD_DOESNT_MATCH';

		try {
			const user = await findUserByUsername(username, 'CREATE_USER');
			if (user) throw 'USER_ALREADY_EXISTS';

			const {
				salt,
				passwordHash: password_hash,
			} = salter.hash(password, salter.generateSalt());
			const newUser = new User({ password_hash, salt, username });
			await newUser.save().catch(err => {
				throw 'CREATE_USER';
			});

			return newUser;
		} catch (err) {
			handleError(err, 'CREATE_USER');
		}
	} catch (errorEnum) {
		throw { culprit: 'UserModal', errorEnum };
	}
}; // createUser

const validateUserLogin = async ({ username, password }) => {
	try {
		validateUsernameAndPassword({ password, username });

		try {
			const userDocument = await findUserByUsername(
				username,
				'VALIDATE_USER_LOGIN'
			);
			if (!userDocument) throw 'USERNAME_PASSWORD_INCORRECT';

			const userHash = salter.hash(password, userDocument.salt);
			if (userDocument.password_hash !== userHash.passwordHash)
				throw 'USERNAME_PASSWORD_INCORRECT';

			return userDocument;
		} catch (err) {
			handleError(err, 'VALIDATE_USER_LOGIN');
		}
	} catch (errorEnum) {
		throw { culprit: 'UserModal', errorEnum };
	}
}; // validateUserLogin

module.exports = { createUser, validateUserLogin };
