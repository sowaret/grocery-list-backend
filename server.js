const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const { API_PORT, DB_ROUTE } = require('./config');
const routes = require('./routes');
const createWebSocketServer = require('./websocket/webSocketServer');

mongoose
	.connect(DB_ROUTE, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(_ => {
		const app = express()
			.use( cors() )
			.use( express.json() )
			.use('/api/v1', routes);

		app.listen(API_PORT, _ => console.log(`\nConnection successful, listening on port ${API_PORT}.`));
	})
	.catch(err => console.log('Could not connect to database:', err.toString()));

// Handle errors after initial connection
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

createWebSocketServer(8080);
