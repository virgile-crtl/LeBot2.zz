import getAllTracksFromGuildFolder from '../utils/getAllTracksFromGuildFolder';
import fs from 'fs';
import path from 'path';

describe('getAllTracksFromFolder', () => {
	const guild_id = 'guild1';

	beforeAll(() => {
		fs.mkdirSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id), { recursive: true });
		fs.writeFileSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id, 'track1.mp3'), 'dummy content');
		fs.writeFileSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id, 'track2.mp3'), 'dummy content');
		fs.writeFileSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id, 'track3.mp3'), 'dummy content');
		fs.writeFileSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id, 'not_a_track.txt'), 'dummy content');
	});

	afterAll(() => {
		fs.rmSync(process.env.TEST_FOLDER!, { recursive: true });
	});

	test('should throw ClientError with noTracksInServer message when folder does not exist', () => {
		expect(() => getAllTracksFromGuildFolder('nonexistent_guild')).toThrow('errors.music.noTracksInServer');
	});

	test('should throw ClientError with noTracksInServer message when folder is empty', () => {
		const empty_guild_id = 'empty_guild';
		fs.mkdirSync(path.join(process.env.PLAYLISTS_FOLDER!, empty_guild_id), { recursive: true });
		expect(() => getAllTracksFromGuildFolder(empty_guild_id)).toThrow('errors.music.noTracksInServer');
	});

	test('should return list of track names without extensions', () => {
		const tracks = getAllTracksFromGuildFolder(guild_id);
		expect(tracks).toEqual(expect.arrayContaining(['track1', 'track2', 'track3']));
		expect(tracks).not.toContain('not_a_track');
	});
});