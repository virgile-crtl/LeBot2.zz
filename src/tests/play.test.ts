import { getVoiceConnection } from '@discordjs/voice';
import { GuildMember } from 'discord.js';
import fs from 'fs';
import play from '../cmd/play';
import PlayerService from '../playerService';
import path from 'path';
import GuildPlayer from '../guildPlayer';
import getAllTracksFromGuildFolder from '../utils/getAllTracksFromGuildFolder';

jest.mock('../playerService', () => ({
	getInstance: jest.fn(),
}));

jest.mock('../guildPlayer', () => jest.fn());

jest.mock('../utils/getAllTracksFromGuildFolder', () => ({
	__esModule: true,
	default: jest.fn(),
}));

describe('playCommand', () => {
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
				channelId: 'voiceChannel1',
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

	test('Play with connection', async () => {
		fs.mkdirSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id), { recursive: true });
		fs.writeFileSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id, 'track1.mp3'), 'data');
		(getVoiceConnection as jest.Mock).mockReturnValue(true);
		(PlayerService.getInstance as jest.Mock).mockReturnValue(mockPlayerService);
		mockInteraction.member = { voice: { channelId: channel_id } };
		Object.setPrototypeOf(mockInteraction.member, GuildMember.prototype);

		await play.execute(mockInteraction);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect(PlayerService.getInstance).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.updatePlayer).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.updatePlayer).toHaveBeenCalledWith('track1', guild_id, channel_id, null);
		expect(mockReply).toHaveBeenCalledTimes(1);
		expect(mockReply).toHaveBeenCalledWith('music.trackAdd');
	});

	test('Play without connection and rand set', async () => {
		fs.mkdirSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id), { recursive: true });
		fs.writeFileSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id, 'track1.mp3'), 'data');
		(getVoiceConnection as jest.Mock).mockReturnValue(false);
		(GuildPlayer as jest.Mock).mockReturnValue(mockPlayer);
		(mockInteraction.options.getBoolean as jest.Mock).mockReturnValue(false);
		(PlayerService.getInstance as jest.Mock).mockReturnValue(mockPlayerService);
		mockInteraction.member = { voice: { channelId: channel_id } };
		Object.setPrototypeOf(mockInteraction.member, GuildMember.prototype);

		await play.execute(mockInteraction);
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
		expect(mockReply).toHaveBeenCalledTimes(1);
		expect(mockReply).toHaveBeenCalledWith('music.play');
	});

	test('Play without connection and rand not set', async () => {
		fs.mkdirSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id), { recursive: true });
		fs.writeFileSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id, 'track1.mp3'), 'data');
		(GuildPlayer as jest.Mock).mockReturnValue(mockPlayer);
		(getVoiceConnection as jest.Mock).mockReturnValue(false);
		(mockInteraction.options.getBoolean as jest.Mock).mockReturnValue(null);
		(PlayerService.getInstance as jest.Mock).mockReturnValue(mockPlayerService);
		mockInteraction.member = { voice: { channelId: channel_id } };
		Object.setPrototypeOf(mockInteraction.member, GuildMember.prototype);

		await play.execute(mockInteraction);
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
		expect(mockReply).toHaveBeenCalledTimes(1);
		expect(mockReply).toHaveBeenCalledWith('music.play');
	});

	test('Play autocomplete with < 25', async () => {
		(getAllTracksFromGuildFolder as jest.Mock).mockReturnValue(['track1', 'track2', 'track3', 'track4', 'track5',
			'track6', 'track7', 'track8', 'track9', 'track10', 'track11', 'track12', 'track13', 'track14', 'track15']);

		await play.autocomplete(mockInteraction);
		expect(mockInteraction.options.getFocused).toHaveBeenCalledTimes(1);
		expect(getAllTracksFromGuildFolder).toHaveBeenCalledTimes(1);
		expect(getAllTracksFromGuildFolder).toHaveBeenCalledWith(guild_id);
		expect(mockInteraction.respond).toHaveBeenCalledTimes(1);
		expect(mockInteraction.respond).toHaveBeenCalledWith([
			{ name: 'track1', value: 'track1' },
			{ name: 'track2', value: 'track2' },
			{ name: 'track3', value: 'track3' },
			{ name: 'track4', value: 'track4' },
			{ name: 'track5', value: 'track5' },
			{ name: 'track6', value: 'track6' },
			{ name: 'track7', value: 'track7' },
			{ name: 'track8', value: 'track8' },
			{ name: 'track9', value: 'track9' },
			{ name: 'track10', value: 'track10' },
			{ name: 'track11', value: 'track11' },
			{ name: 'track12', value: 'track12' },
			{ name: 'track13', value: 'track13' },
			{ name: 'track14', value: 'track14' },
			{ name: 'track15', value: 'track15' },
		]);
	});

	test('Play autocomplete with < 25', async () => {
		(getAllTracksFromGuildFolder as jest.Mock).mockReturnValue(['track1', 'track2', 'track3', 'track4', 'track5',
			'track6', 'track7', 'track8', 'track9', 'track10', 'track11', 'track12', 'track13', 'track14', 'track15',
			'track16', 'track17', 'track18', 'track19', 'track20', 'track21', 'track22', 'track23', 'track24', 'track25',
			'track26', 'track27', 'track28', 'track29', 'track30']);

		await play.autocomplete(mockInteraction);
		expect(mockInteraction.options.getFocused).toHaveBeenCalledTimes(1);
		expect(getAllTracksFromGuildFolder).toHaveBeenCalledTimes(1);
		expect(getAllTracksFromGuildFolder).toHaveBeenCalledWith(guild_id);
		expect(mockInteraction.respond).toHaveBeenCalledTimes(1);
		expect(mockInteraction.respond).toHaveBeenCalledWith([
			{ name: 'track1', value: 'track1' },
			{ name: 'track2', value: 'track2' },
			{ name: 'track3', value: 'track3' },
			{ name: 'track4', value: 'track4' },
			{ name: 'track5', value: 'track5' },
			{ name: 'track6', value: 'track6' },
			{ name: 'track7', value: 'track7' },
			{ name: 'track8', value: 'track8' },
			{ name: 'track9', value: 'track9' },
			{ name: 'track10', value: 'track10' },
			{ name: 'track11', value: 'track11' },
			{ name: 'track12', value: 'track12' },
			{ name: 'track13', value: 'track13' },
			{ name: 'track14', value: 'track14' },
			{ name: 'track15', value: 'track15' },
			{ name: 'track16', value: 'track16' },
			{ name: 'track17', value: 'track17' },
			{ name: 'track18', value: 'track18' },
			{ name: 'track19', value: 'track19' },
			{ name: 'track20', value: 'track20' },
			{ name: 'track21', value: 'track21' },
			{ name: 'track22', value: 'track22' },
			{ name: 'track23', value: 'track23' },
			{ name: 'track24', value: 'track24' },
			{ name: 'track25', value: 'track25' },
		]);
	});
});

