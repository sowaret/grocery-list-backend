const WebSocket = require('ws');
const { send } = require('../functions');
const wsControllers = require('./controllers');
const WSApp = require('./classes/WSApp');

const configureClient = ({ App, client }) => client
	.on('message', async data => {
		if (data === 'pong') return client.isAlive = true;
		if (!(data = JSON.parse(data))) return; // TODO from prev: ?

		const { type, ...payload } = data;
		if (type in wsControllers)
			await dispatchController({ App, client, data: payload, type });
	})
	.on('close', _ => {
		if (client.sheet) client.sheet.disconnectUser(client);
		console.log(`LEAVING: ${client.id}`);
	});

const connectClient = ({ App, client }) => {
	client.id = generateClientId();
	client.isAlive = true;
	configureClient({ App, client });

	console.log(`${client.id} connected`);
	send(client, { type: 'WS_CONNECTED' });
};

const createWebSocketServer = port => {
	const wsServer = new WebSocket.Server({ port });
	const App = new WSApp();
	wsServer.on('connection', client => connectClient({ App, client }));
	return wsServer;
};

const dispatchController = async ({ App, client, data, type }) => {
	try {
		await wsControllers[type].try({ App, client, data });
	} catch (error) {
		wsControllers[type].catch({ client, error });
	}
};

const generateClientId = _ => Math
	.floor((1+Math.random()) * 0x10000)
	.toString(16);

module.exports = { createWebSocketServer, send };
