import path from 'path';
import putTrackInPlayer from '../utils/putTrackInPlayer';

describe('putTrackInPlayer error', () => {
	const guild_id = 'guild1';
	const text_channel_id = 'channel1';
	const mockReply = jest.fn();
	const mockChannel = { isTextBased: () => true };
	const mockInteraction: any = {
	  guildId: guild_id,
	};

	test('putTrackInPlayer without text channel', async () => {
		await expect(putTrackInPlayer(mockInteraction, path.join(process.env.PLAYLISTS_FOLDER!, guild_id), 'track1', mockReply())).rejects.toThrow('errors.cmd.commandInTextChannel');
	});

	test('Play whithout voice channel', async () => {
		(mockInteraction as any).channel = mockChannel;
		(mockInteraction as any).channelId = text_channel_id;

		await expect(putTrackInPlayer(mockInteraction, path.join(process.env.PLAYLISTS_FOLDER!, guild_id), 'track1', mockReply())).rejects.toThrow('errors.music.needVoiceChannel');
	});
});

