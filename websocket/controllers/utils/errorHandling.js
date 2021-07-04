const { err: ERROR } = require('../../../enums');
const { send } = require('../../../functions');

const formatAndHandleError = ({ client, culprit, error }) => {
	// Check if error is enum
	const anyEnum = error.error || error;
	const errorEnum = anyEnum in ERROR && anyEnum;
	const formattedError = errorEnum ? { errorEnum } : { error };
	handleError({ client, culprit, ...formattedError });
};

const handleError = ({ client, culprit, error, errorEnum }) => {
	let errorRes = ERROR[errorEnum];
	if (!errorEnum) {
		console.error(error);
		errorRes = { message: error.message };
	}
	send(client, {
		...culprit && {
			type: 'CULPRIT_ERROR',
			culprit,
		},
		error: errorRes,
	});
};

module.exports = { formatAndHandleError, handleError };
