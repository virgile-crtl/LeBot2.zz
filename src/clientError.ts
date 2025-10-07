export default class ClientError extends Error {
	err: any;

	constructor(message?: string) {
		super(message);
	}

	static fromError(err: any, new_message?: string): ClientError {
  	const messagePart = err?.message ?? String(err ?? 'Unknown error');
		if (!new_message) {
			const newErr = new ClientError(messagePart);
			newErr.err = err;
  		return newErr;
		}
  	const newErr = new ClientError(new_message + '\n' + messagePart);
  	newErr.err = err;
  	return newErr;
	}
}