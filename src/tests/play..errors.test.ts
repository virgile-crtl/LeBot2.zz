import { GuildMember } from 'discord.js';
import play from '../cmd/play';
import fs from 'fs';
import path from 'path';

jest.mock('../playerService', () => ({
	getInstance: jest.fn(),
}));

describe('playCommand error', () => {
	const guild_id = 'guild1';
	const channel_id = 'channel1';
	const mockReply = jest.fn();
	const mockChannel = { isTextBased: () => true };
	const mockInteraction: any = {
	  guildId: guild_id,
	  channel: mockChannel,
	  channelId: channel_id,
	  reply: mockReply,
		options: {
			getString: jest.fn(() => 'track1'),
		},
		member: {
			voice: {
				channelId: 'voiceChannel1',
			},
		} as GuildMember,
	};

	test('Play without guild folder', async () => {
		await expect(play.execute(mockInteraction)).rejects.toThrow('errors.music.noTracksInServer');
	});

	test('Play without track', async () => {
		fs.mkdirSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id), { recursive: true });
		await expect(play.execute(mockInteraction)).rejects.toThrow('errors.music.trackNotFound');
	});

	test('Play without voice channel', async () => {
		fs.writeFileSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id, 'track1.mp3'), 'data');
		mockInteraction.member.voice.channelId = null;
		await expect(play.execute(mockInteraction)).rejects.toThrow('errors.music.needVoiceChannel');
	});

	test('Play whithout text channel', async () => {
		fs.writeFileSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id, 'track1.mp3'), 'data');
		mockInteraction.member = { voice: { channelId: 'voiceChannel1' } };
		Object.setPrototypeOf(mockInteraction.member, GuildMember.prototype);
		mockInteraction.channel = undefined;

		await expect(play.execute(mockInteraction)).rejects.toThrow('errors.cmd.commandInTextChannel');
	});
});

