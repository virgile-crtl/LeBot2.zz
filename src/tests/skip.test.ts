import { getVoiceConnection } from '@discordjs/voice';
import PlayerService from '../playerService';
import skip from '../cmd/skip';

jest.mock('../playerService', () => ({
	getInstance: jest.fn(),
}));

describe('pauseCommand', () => {
	const guild_id = 'guild1';
	const channel_id = 'channel1';
	const mockReply = jest.fn();
	const mockChannel = { isTextBased: () => true };
	const mockInteraction: any = {
	  guildId: guild_id,
	  channel: mockChannel,
	  channelId: channel_id,
	  reply: mockReply,
	};
	const mockPlayer = {
  	skip: jest.fn(),
  	updateChannelId: jest.fn(),
	};
	const mockPlayerService = {
		getGuildPlayer: jest.fn(() => mockPlayer),
		deleteGuildPlayer: jest.fn(),
	};

	beforeAll(() => {
		jest.spyOn(console, 'error').mockImplementation(() => {return;});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('Skip without connection', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(null);
		await expect(skip.execute(mockInteraction)).rejects.toThrow('errors.music.notInServer');
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
	});

	test('Skip with connection but cmd not in TextChannel', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(true);
		mockInteraction.channel = undefined;

		await expect(skip.execute(mockInteraction)).rejects.toThrow('errors.cmd.commandInTextChannel');
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
	});

	test('Skip with next track', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(true);
		(PlayerService.getInstance as jest.Mock).mockReturnValue(mockPlayerService);
		mockPlayer.skip.mockReturnValue('track1');
		mockInteraction.channel = mockChannel;

		await skip.execute(mockInteraction);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect(PlayerService.getInstance).toHaveBeenCalledTimes(1);
		expect(PlayerService.getInstance().getGuildPlayer).toHaveBeenCalledTimes(1);
		expect(PlayerService.getInstance().getGuildPlayer).toHaveBeenCalledWith(guild_id);
		expect(mockPlayer.skip).toHaveBeenCalledTimes(1);
		expect(mockPlayer.updateChannelId).toHaveBeenCalledTimes(1);
		expect(mockPlayer.updateChannelId).toHaveBeenCalledWith(channel_id);
		expect(mockReply).toHaveBeenCalledTimes(1);
		expect(mockReply).toHaveBeenCalledWith('music.skipTrack');
	});

	test('Skip with stop', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(true);
		(PlayerService.getInstance as jest.Mock).mockReturnValue(mockPlayerService);
		mockPlayer.skip.mockReturnValue(undefined);
		mockInteraction.channel = mockChannel;

		await skip.execute(mockInteraction);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect(PlayerService.getInstance).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.getGuildPlayer).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.getGuildPlayer).toHaveBeenCalledWith(guild_id);
		expect(mockPlayer.skip).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.deleteGuildPlayer).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.deleteGuildPlayer).toHaveBeenCalledWith(guild_id);
		expect(mockReply).toHaveBeenCalledTimes(1);
		expect(mockReply).toHaveBeenCalledWith('music.stopNoTracks');
	});
});

