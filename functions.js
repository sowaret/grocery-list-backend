const fs = require('fs');
const en = require('./enums');
const envItems = ['AUTH_STRING', 'TOKEN', 'TOKEN_EXPIRES_AT'];

module.exports = {
	formatCurrentDate: _ => {
		const date = new Date();
		return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
	},

	generateRandomCode: (length, isPassCode) => {
		let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		if (isPassCode) chars = chars + chars.toLowerCase() + '1234567890';
		const count = chars.length;
		let res = '';

		for (let i = 0; i < length; i++) {
			res += chars.charAt(Math.floor(Math.random() * count));
		}

		return res;
	},

	JsonError: (res, _enum) => {
		if (!Object.keys(en.err).includes(_enum)) {
			console.trace();
			throw `JsonError: Key \`${_enum}\` does not exist`;
		}

		return res.status(en.err[_enum].status).json({
			code: en.err[_enum].code,
			messages: [en.err[_enum].message],
		});
	},

	// WebSocket send
	send: (client, data) => client.send(JSON.stringify(data)),

	unixTimestamp: _ => Math.floor(Date.now() / 1000),

	updateEnvFile: newValues => {
		for (const key in newValues) {
			process.env[key] = newValues[key];
		}
		const envContents = envItems
			.map(item => `${item}=${process.env[item]}`)
			.join('\n');
		fs.writeFileSync('.env', envContents);
	},

	validateRequest: (req, res, validate = {}) => {
		let status = 200,
			json = { code: 0, messages: [] };

		if (!Object.keys(req.body).length) {
			status = 400;
			json.code = 3;
			json.messages.push('Request cannot be empty');
		} else {
			// Validate required keys
			if (validate.all) {
				const missing = validate.all.filter(v =>
					!Object.keys(req.body).includes(v)
				);

				if (missing.length) {
					status = 400;
					json.code = en.err.REQUIRED_FIELD_MISSING.code;
					missing.forEach(v => {
						json.messages.push(`\`${v}\` is required`);
					});
				}
			}

			// Validate mutually-exclusive keys
			if (validate.one) {
				const mutuallyExclusive = Object.keys(req.body).filter(v =>
					validate.one.includes(v)
				);

				// If more than one mutually-exclusive parameter is in request body
				if (mutuallyExclusive.length > 1) {
					status = 400;
					json.code = en.err.MUTUALLY_EXCLUSIVE_FIELDS.code;
					json.messages.push(`${mutuallyExclusive.join(', ')} are mutually-exclusive`);
				}
			}
		}

		if (status === 200) return false;

		return res.status(status).json(json);
	},
};
