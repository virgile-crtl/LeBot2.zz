import play from '../cmd/play';
import fs from 'fs';
import path from 'path';

describe('playCommand error', () => {
	const guild_id = 'guild1';
	const channel_id = 'channel1';
	const mockInteraction: any = {
	  guildId: guild_id,
	  channelId: channel_id,
		options: {
			getString: jest.fn(() => 'track1'),
		},
	};

	beforeEach(() => {
		fs.rmSync(process.env.TEST_FOLDER!, { recursive: true, force: true });
	});
	test('Play without guild folder', async () => {
		await expect(play.execute(mockInteraction)).rejects.toThrow('errors.music.noTracksInServer');
	});

	test('Play without track', async () => {
		fs.mkdirSync(path.join(process.env.MUSIC_FOLDER!, guild_id), { recursive: true });
		await expect(play.execute(mockInteraction)).rejects.toThrow('errors.music.trackNotFound');
	});
});

