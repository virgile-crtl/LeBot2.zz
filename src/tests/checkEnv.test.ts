import checkEnv from '../utils/checkEnv';

jest.mock('../utils/setupEnv', () => ({
	__esModule: true,
	default: jest.fn(),
}));

describe('Check Environment Variables', () => {

	beforeEach(() => {
		process.exit = jest.fn() as any;
		console.error = jest.fn();
	});

	test('Get Env Variables in prod', () => {
		process.env.NODE_ENV = 'prod';
		expect(checkEnv()).toBeUndefined();
	});

	test('Get Env Variables in dev', () => {
		process.env.NODE_ENV = 'dev';
		expect(checkEnv()).toBeUndefined();
	});

	test('Missing Env Variable', () => {
		delete process.env.BOT_TOKEN;

		expect(checkEnv()).toBeUndefined();
		expect(process.exit).toHaveBeenCalledWith(1);
		expect(console.error).toHaveBeenCalledWith('The environment variable BOT_TOKEN is not defined');
	});

	test('Env Variable not a folder', () => {
		process.env.CMDS_FOLDER = '/path/that/does/not/exist';
		expect(checkEnv()).toBeUndefined();
		expect(process.exit).toHaveBeenCalledWith(1);
		expect(console.error).toHaveBeenCalledWith('The folder specified by CMDS_FOLDER does not exist or is not a directory: ' + require('path').resolve(process.env.CMDS_FOLDER!));
	});
});