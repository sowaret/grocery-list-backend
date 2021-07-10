const { createWebSocketServer } = require('@sowaret/redux-websocket-middleware');
const wsControllers = require('./controllers');
const WSApp = require('./classes/WSApp');

module.exports = () => createWebSocketServer({
	controllers: wsControllers,
	onClose: client => {
		if (client.sheet) client.sheet.disconnectUser(client);
	},
	wsClass: WSApp,
	wsClassParamName: 'App',
});
