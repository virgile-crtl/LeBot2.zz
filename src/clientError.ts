export default class ClientError extends Error {
	err: any;

	constructor(message?: string, err?: any) {
  	const old_message = err?.message ?? String(err ?? 'Unknown error');
		if (message && err) {
			super(message + '\n' + old_message);
			this.err = err;
		}
		else if (message && !err) {
  		super(message);
		}
		else {
			super(old_message);
			if (err) this.err = err;
		}
	}
}