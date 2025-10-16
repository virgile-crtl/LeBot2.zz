import { getVoiceConnection } from '@discordjs/voice';
import { GuildMember } from 'discord.js';
import fs from 'fs';
import GuildPlayer from '../guildPlayer';
import PlayerService from '../playerService';
import path from 'path';
import putTrackInPlayer from '../utils/putTrackInPlayer';

jest.mock('../playerService', () => ({
	getInstance: jest.fn(),
}));

jest.mock('../guildPlayer', () => jest.fn());

describe('playCommand', () => {
	const respond = jest.fn();
	const guild_id = 'guild1';
	const channel_id = 'channel1';
	const mockReply = jest.fn();
	const mockChannel = { isTextBased: () => true };
	const mockInteraction: any = {
		guildId: guild_id,
		channel: mockChannel,
		channelId: channel_id,
		reply: mockReply,
		client: {} as any,
		options: {
			getString: jest.fn(() => 'track1'),
			getBoolean: jest.fn(() => null),
			getFocused: jest.fn(() => 'tra'),
		},
		member: {
			voice: {
				channelId: 'channel1',
			},
		} as GuildMember,
		guild: { voiceAdapterCreator: undefined },
		respond: jest.fn(),
	};
	const mockPlayer = {
		play: jest.fn(),
	};
	const mockPlayerService = {
		getGuildPlayer: jest.fn(() => mockPlayer),
		deleteGuildPlayer: jest.fn(),
		updatePlayer: jest.fn(),
		saveGuildPlayer: jest.fn(),
	};

	beforeAll(() => {
		jest.spyOn(console, 'error').mockImplementation(() => {return;});
		Object.setPrototypeOf(mockInteraction.member, GuildMember.prototype);
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterEach(() => {
		fs.rmSync(process.env.TEST_FOLDER!, { recursive: true, force: true });
	});

	test('Play with connection', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(true);
		(PlayerService.getInstance as jest.Mock).mockReturnValue(mockPlayerService);

		await putTrackInPlayer(mockInteraction, path.join(process.env.PLAYLISTS_FOLDER!, guild_id), 'track1', respond);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect(PlayerService.getInstance).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.updatePlayer).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.updatePlayer).toHaveBeenCalledWith('track1', guild_id, channel_id, null);
		expect(respond).toHaveBeenCalledTimes(1);
		expect(respond).toHaveBeenCalledWith('music.trackAdd');
	});

	test('Play without connection and rand set', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(false);
		(GuildPlayer as jest.Mock).mockReturnValue(mockPlayer);
		(mockInteraction.options.getBoolean as jest.Mock).mockReturnValue(false);
		(PlayerService.getInstance as jest.Mock).mockReturnValue(mockPlayerService);

		await putTrackInPlayer(mockInteraction, path.join(process.env.PLAYLISTS_FOLDER!, guild_id), 'track1', respond);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect(PlayerService.getInstance).toHaveBeenCalledTimes(1);
		expect(GuildPlayer).toHaveBeenCalledTimes(1);
		expect(GuildPlayer).toHaveBeenCalledWith(guild_id, false, channel_id,
			mockInteraction.client, {
				channelId: channel_id,
				guildId: guild_id,
				adapterCreator: undefined,
			});
		expect(mockInteraction.options.getBoolean).toHaveBeenCalledWith('rand');
		expect(mockPlayer.play).toHaveBeenCalledTimes(1);
		expect(mockPlayer.play).toHaveBeenCalledWith(path.join(process.env.PLAYLISTS_FOLDER!, guild_id, 'track1.mp3'));
		expect(mockPlayerService.saveGuildPlayer).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.saveGuildPlayer).toHaveBeenCalledWith(guild_id, mockPlayer);
		expect(respond).toHaveBeenCalledTimes(1);
		expect(respond).toHaveBeenCalledWith('music.play');
	});

	test('Play without connection and rand not set', async () => {
		(GuildPlayer as jest.Mock).mockReturnValue(mockPlayer);
		(getVoiceConnection as jest.Mock).mockReturnValue(false);
		(mockInteraction.options.getBoolean as jest.Mock).mockReturnValue(null);
		(PlayerService.getInstance as jest.Mock).mockReturnValue(mockPlayerService);

		await putTrackInPlayer(mockInteraction, path.join(process.env.PLAYLISTS_FOLDER!, guild_id), 'track1', respond);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect(PlayerService.getInstance).toHaveBeenCalledTimes(1);
		expect(GuildPlayer).toHaveBeenCalledTimes(1);
		expect(GuildPlayer).toHaveBeenCalledWith(guild_id, true, channel_id,
			mockInteraction.client, {
				channelId: channel_id,
				guildId: guild_id,
				adapterCreator: undefined,
			});
		expect(mockInteraction.options.getBoolean).toHaveBeenCalledWith('rand');
		expect(mockPlayer.play).toHaveBeenCalledTimes(1);
		expect(mockPlayer.play).toHaveBeenCalledWith(path.join(process.env.PLAYLISTS_FOLDER!, guild_id, 'track1.mp3'));
		expect(mockPlayerService.saveGuildPlayer).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.saveGuildPlayer).toHaveBeenCalledWith(guild_id, mockPlayer);
		expect(respond).toHaveBeenCalledTimes(1);
		expect(respond).toHaveBeenCalledWith('music.play');
	});
});