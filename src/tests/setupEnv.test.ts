import fs from 'fs';
import setupEnv from '../utils/setupEnv';
import path from 'path';

describe('Setup Environment Variables', () => {
	const playlists_folder = 'fixture/playlists';

	afterEach(() => {
		jest.resetAllMocks();
		fs.rmSync(playlists_folder, { recursive: true, force: true });
	});

	test('should have the required environment variables set and env not defined', () => {
		delete process.env.CMDS_FOLDER;
		delete process.env.TRANSLATION_FOLDER;
		delete process.env.PLAYLISTS_FOLDER;
		setupEnv();

		expect(process.env.TRANSLATION_FOLDER).toBe(path.resolve('locales'));
		expect(process.env.CMDS_FOLDER).toBe(path.resolve('src/cmd'));
		expect(process.env.PLAYLISTS_FOLDER).toBe(path.resolve('playlists'));
	});

	test('should have the required environment variables set and prod env', () => {
		process.env.NODE_ENV = 'prod';
		process.env.PLAYLISTS_FOLDER = 'test';
		delete process.env.CMDS_FOLDER;
		delete process.env.TRANSLATION_FOLDER;
		setupEnv();

		expect(process.env.TRANSLATION_FOLDER).toBe(path.resolve('locales'));
		expect(process.env.CMDS_FOLDER).toBe(path.resolve('dist/cmd'));
		expect(process.env.PLAYLISTS_FOLDER).toBe('test');
	});

	test('should create playlists folder if it does not exist', () => {
		process.env.PLAYLISTS_FOLDER = playlists_folder;
		setupEnv();

		const folderExists = fs.existsSync(playlists_folder);
		expect(folderExists).toBe(true);
	});

});
