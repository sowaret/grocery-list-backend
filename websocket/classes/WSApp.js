const crypto = require('crypto');
const { createSheet, getSheetByCode } = require('../../controllers/sheet');
const { send } = require('../../functions');
const { hash } = require('../../utils/salter');
const WSSheet = require('./WSSheet');
const WSUser = require('./WSUser');

class WSApp {
	constructor() {
		this.authClients = {};
		this.sheets = {};
	}

	addAuthClient({ client, userDocument }) {
		client.user = new WSUser({ client, userDocument });
		const cookie = crypto.randomBytes(32).toString('hex');
		this.authClients[cookie] = userDocument;
		return cookie;
	}

	reconnectAuthClient({ client, cookie, id }) {
		this.validateClientReconnect({ client, cookie, id });
		const userDocument = this.authClients[cookie];
		// Create a new WSUser for the fresh socket
		client.user = new WSUser({ client, userDocument });

		const { _id, username } = userDocument;
		send(client, { type: 'RECONNECTED_USER', user: { _id, username } });
	}

	async enrichSheetAndApplyToApp(sheetId) {
		const sheet = new WSSheet(sheetId);
		await sheet.enrichWithSheetDetails();
		this.sheets[sheetId] = sheet;
		return sheet;
	}

	async findSheetOrCreate({ sheetId }) {
		return this.sheets[sheetId]
			|| await this.enrichSheetAndApplyToApp(sheetId);
	}

	async createSheetDocument({ user }) {
		const { document, password } =
			await createSheet({ owner: user.document });
		const wsSheet = await this.enrichSheetAndApplyToApp(document.id);
		await wsSheet.joinUser(user);
		return { password, wsSheet };
	}

	validateClientReconnect({ client, cookie, id }) {
		if (!(cookie in this.authClients)) throw 'invalid cookie';
		const { id: authId } = this.authClients[cookie];
		if (authId !== id) throw 'invalid cookie';
	}

	async validateSheetJoin({ client, password, sheetCode }) {
		const { sheet } = await getSheetByCode(sheetCode);
		const { passwordHash } = hash(password, '');
		if (passwordHash !== sheet.password)
			throw 'SHEET_PASSWORD_INCORRECT';

		const wsSheet = await this.findSheetOrCreate({ sheetId: sheet.id });
		client.sheet = wsSheet;
		await wsSheet.joinUser(client.user);

		return wsSheet;
	}
}

module.exports = WSApp;
