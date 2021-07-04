const crypto = require('crypto');

const methods = {
	generateSalt: _ => crypto.randomBytes(8).toString('hex').slice(0, 15),
	hasher: (password, salt) => {
		const hash = crypto.createHmac('sha512', salt).update(password);
		const passwordHash = hash.digest('hex');
		return { salt, passwordHash };
	},
	hash: (password, salt) => methods.hasher(password, salt),
	compare: (password, hash) => {
		const passwordData = methods.hasher(password, hash.salt);
		return passwordData.passwordHash === hash.passwordHash;
	},
};

module.exports = methods;
