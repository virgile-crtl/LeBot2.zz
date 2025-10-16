import ClientError from '../clientError';

describe('Client Error Handling', () => {
	test('ClientError with only message parameter', () => {
		const clientError = new ClientError('Custom error message');
		expect(clientError.message).toBe('Custom error message');
		expect(clientError.err).toBeUndefined();
	});

	test('ClientError with only err parameter', () => {
		const originalError = new Error('Original error message');
		const clientError = new ClientError(undefined, originalError);
		expect(clientError.message).toBe('Original error message');
		expect(clientError.err).toBe(originalError);
	});

	test('ClientError with both message and err parameters', () => {
		const originalError = new Error('Original error message');
		const clientError = new ClientError('Custom error message', originalError);
		expect(clientError.message).toBe('Custom error message\nOriginal error message');
		expect(clientError.err).toBe(originalError);
	});

	test('ClientError with neither parameter', () => {
		const clientError = new ClientError();
		expect(clientError.message).toBe('Unknown error');
		expect(clientError.err).toBeUndefined();
	});
});