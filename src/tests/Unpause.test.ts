import { getVoiceConnection } from '@discordjs/voice';
import PlayerService from '../playerService';
import unpause from '../cmd/unpause';

jest.mock('@discordjs/voice', () => ({
	getVoiceConnection: jest.fn(),
}));

jest.mock('../playerService', () => ({
	getInstance: jest.fn(),
}));

jest.mock('i18next', () => ({
	t: jest.fn((key) => key),
}));

describe('pauseCommand', () => {
	const guild_id = 'guild1';
	const mockReply = jest.fn();
	const mockChannel = { isTextBased: () => true };
	const mockInteraction: any = {
	  guildId: guild_id,
	  channel: mockChannel,
	  channelId: 'channel1',
	  reply: mockReply,
	};
	const mockPlayer = {
  	unpause: jest.fn(),
  	updateChannelId: jest.fn(),
	};

	beforeAll(() => {
		jest.spyOn(console, 'error').mockImplementation(() => {return;});
	});

	test('Unpause without connection', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(null);
		await expect(unpause.execute(mockInteraction)).rejects.toThrow('errors.music.notPlay');
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
	});

	test('Unpause with connection but cmd not in TextChannel', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(true);
		mockInteraction.channel = undefined;

		await expect(unpause.execute(mockInteraction)).rejects.toThrow('errors.cmd.commandInTextChannel');
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
	});

	test('Unpause', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(true);
		(PlayerService.getInstance as jest.Mock).mockReturnValue({
			getGuildPlayer: jest.fn(() => mockPlayer),
		});
		mockInteraction.channel = mockChannel;

		await unpause.execute(mockInteraction);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect(mockPlayer.unpause).toHaveBeenCalledTimes(1);
		expect(mockPlayer.updateChannelId).toHaveBeenCalledTimes(1);
		expect(mockPlayer.updateChannelId).toHaveBeenCalledWith('channel1');
		expect(mockReply).toHaveBeenCalledWith('music.resumedTrack');
	});
});

