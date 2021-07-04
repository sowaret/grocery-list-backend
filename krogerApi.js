require('dotenv').config();
const axios = require('axios');
const qs = require('qs');
const { unixTimestamp, updateEnvFile } = require('./functions');

const baseUrl = 'https://api.kroger.com/v1';
const axiosInstance = axios.create({
	headers: {
		Accept: 'application/json',
		Authorization: `Bearer ${process.env.TOKEN}`,
	},
});

const tokenEndpointConfig = {
	method: 'post',
	url: 'https://api.kroger.com/v1/connect/oauth2/token',
	headers: { 
		Accept: 'application/json', 
		Authorization: process.env.AUTH_STRING, 
		'Content-Type': 'application/x-www-form-urlencoded', 
	},
	data: qs.stringify({
		grant_type: 'client_credentials',
		scope: 'product.compact',
	}),
};

const updateBearerToken = async _ => {
	try {
		const response = await axios(tokenEndpointConfig);
		const { access_token, expires_in } = response.data;

		axiosInstance.defaults.headers['Authorization'] =
			`Bearer ${access_token}`;
		updateEnvFile({
			TOKEN: access_token,
			TOKEN_EXPIRES_AT: unixTimestamp() + expires_in,
		});
	} catch (err) {
		console.error(err);
	}
};

const API = {
	get: async (route, params, callbacks) => {
		if (process.env.TOKEN_EXPIRES_AT < unixTimestamp()) {
			await updateBearerToken();
		}
		try {
			const res = await axiosInstance.get(
				`${baseUrl}${route}`,
				{ params }
			);
			callbacks.success(res.data);
		} catch (err) {
			callbacks.fail(err);
		}
	},
};

module.exports = API;
