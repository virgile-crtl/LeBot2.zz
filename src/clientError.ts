export default class ClientError extends Error {
	err: any;

	constructor(message?: string) {
		super(message);
	}

	static fromError(err: any, new_message?: string): ClientError {
		const myErr: ClientError = new ClientError(new_message + '\n' + err.message);
		myErr.err = err;
		return myErr;
	}
}