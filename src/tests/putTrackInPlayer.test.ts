import { getVoiceConnection } from '@discordjs/voice';
import { GuildMember } from 'discord.js';
import GuildPlayer from '../guildPlayer';
import PlayerService from '../playerService';
import path from 'path';
import putTrackInPlayer from '../utils/putTrackInPlayer';

jest.mock('../playerService', () => ({
	getInstance: jest.fn(),
}));

jest.mock('../guildPlayer', () => jest.fn());

describe('putTrackInPlayer', () => {
	const guild_id = 'guild1';
	const text_channel_id = 'channel1';
	const voice_channel_id = 'voiceChannel1';
	const track_name = 'track1';
	const mockInteraction: any = {
		guildId: guild_id,
		channel: { isTextBased: () => true },
		channelId: text_channel_id,
		reply: jest.fn(),
		client: {} as any,
		options: {
			getBoolean: jest.fn(),
		},
		member: {
			voice: {
				channelId: voice_channel_id,
			},
		} as GuildMember,
		guild: { voiceAdapterCreator: undefined },
	};
	const mockPlayer = {
		play: jest.fn(),
	};
	const mockPlayerService = {
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

	test('PutTrackInPlayer with connection', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(true);
		(PlayerService.getInstance as jest.Mock).mockReturnValue(mockPlayerService);
		mockInteraction.options.getBoolean.mockReturnValue(null);

		await putTrackInPlayer(mockInteraction, path.join(process.env.MUSIC_FOLDER!, guild_id), track_name, mockInteraction.reply);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect(PlayerService.getInstance).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.updatePlayer).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.updatePlayer).toHaveBeenCalledWith(track_name, guild_id, text_channel_id, null);
		expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
		expect(mockInteraction.reply).toHaveBeenCalledWith('music.trackAdd');
	});

	test('PutTrackInPlayer without connection and rand set', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(false);
		(GuildPlayer as jest.Mock).mockReturnValue(mockPlayer);
		(PlayerService.getInstance as jest.Mock).mockReturnValue(mockPlayerService);
		mockInteraction.options.getBoolean.mockReturnValue(false);

		await putTrackInPlayer(mockInteraction, path.join(process.env.MUSIC_FOLDER!, guild_id), track_name, mockInteraction.reply);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect(GuildPlayer).toHaveBeenCalledTimes(1);
		expect(GuildPlayer).toHaveBeenCalledWith(guild_id, false, text_channel_id,
			mockInteraction.client, {
				channelId: voice_channel_id,
				guildId: guild_id,
				adapterCreator: mockInteraction.guild.voiceAdapterCreator,
			});
		expect(PlayerService.getInstance).toHaveBeenCalledTimes(1);
		expect(mockInteraction.options.getBoolean).toHaveBeenCalledWith('rand');
		expect(mockPlayer.play).toHaveBeenCalledTimes(1);
		expect(mockPlayer.play).toHaveBeenCalledWith(path.join(process.env.MUSIC_FOLDER!, guild_id, track_name + '.mp3'));
		expect(mockPlayerService.saveGuildPlayer).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.saveGuildPlayer).toHaveBeenCalledWith(guild_id, mockPlayer);
		expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
		expect(mockInteraction.reply).toHaveBeenCalledWith('music.play');
	});

	test('PutTrackInPlayer without connection and rand not set', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(false);
		(GuildPlayer as jest.Mock).mockReturnValue(mockPlayer);
		(PlayerService.getInstance as jest.Mock).mockReturnValue(mockPlayerService);
		mockInteraction.options.getBoolean.mockReturnValue(null);

		await putTrackInPlayer(mockInteraction, path.join(process.env.MUSIC_FOLDER!, guild_id), track_name, mockInteraction.reply);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect(GuildPlayer).toHaveBeenCalledTimes(1);
		expect(GuildPlayer).toHaveBeenCalledWith(guild_id, true, text_channel_id,
			mockInteraction.client, {
				channelId: voice_channel_id,
				guildId: guild_id,
				adapterCreator: mockInteraction.guild.voiceAdapterCreator,
			});
		expect(PlayerService.getInstance).toHaveBeenCalledTimes(1);
		expect(mockInteraction.options.getBoolean).toHaveBeenCalledWith('rand');
		expect(mockPlayer.play).toHaveBeenCalledTimes(1);
		expect(mockPlayer.play).toHaveBeenCalledWith(path.join(process.env.MUSIC_FOLDER!, guild_id, track_name + '.mp3'));
		expect(mockPlayerService.saveGuildPlayer).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.saveGuildPlayer).toHaveBeenCalledWith(guild_id, mockPlayer);
		expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
		expect(mockInteraction.reply).toHaveBeenCalledWith('music.play');
	});
});