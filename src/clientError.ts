export default class ClientError extends Error {
	err: any;

	constructor(message?: string) {
		super(message);
	}

	static fromError(err: any, newMessage?: string): ClientError {
		const myErr = new ClientError(newMessage + '\n' + err.message);
		myErr.err = err;
		return myErr;
	}
}