import createShuffleStack from '../utils/createShuffleStack';
import fs from 'fs';
import path from 'path';

describe('createShuffleStack', () => {
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

	test('should return a shuffled stack of tracks', () => {
		const stack = createShuffleStack(guild_id);

		expect(stack).toHaveLength(3);
		expect(stack).toEqual(expect.arrayContaining(['track1', 'track2', 'track3']));
	});

	test('should return a different order on subsequent calls', () => {
		const stack1 = createShuffleStack(guild_id);
		const stack2 = createShuffleStack(guild_id);

		expect(stack1).not.toEqual(stack2);
	});
});