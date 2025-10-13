import { getVoiceConnection } from '@discordjs/voice';
import PlayerService from '../playerService';
import pause from '../cmd/pause';

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
  	pause: jest.fn(),
  	updateChannelId: jest.fn(),
	};

	beforeAll(() => {
		jest.spyOn(console, 'error').mockImplementation(() => {return;});
	});

	test('Pause without connection', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(null);
		await expect(pause.execute(mockInteraction)).rejects.toThrow('errors.music.notPlayMusic');
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
	});

	test('Pause with connection but cmd not in TextChannel', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(true);
		mockInteraction.channel = undefined;

		await expect(pause.execute(mockInteraction)).rejects.toThrow('errors.cmd.commandInTextChannel');
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
	});

	test('Pause', async () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(true);
		(PlayerService.getInstance as jest.Mock).mockReturnValue({
			getGuildPlayer: jest.fn(() => mockPlayer),
		});
		mockInteraction.channel = mockChannel;

		await pause.execute(mockInteraction);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
		expect(mockPlayer.updateChannelId).toHaveBeenCalledTimes(1);
		expect(mockPlayer.updateChannelId).toHaveBeenCalledWith('channel1');
		expect(mockReply).toHaveBeenCalledWith('music.pausedTrack');
	});
});

