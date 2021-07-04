const { send } = require('../../functions');

class WSUser {
	constructor({ client, userDocument }) {
		this.document = userDocument;
		this.client = client;

		this.username = userDocument.username;
		this.id = userDocument.id;
		this.customColour = userDocument.customColour;
	}

	send(data) {
		send(this.client, data);
	}
}

module.exports = WSUser;
