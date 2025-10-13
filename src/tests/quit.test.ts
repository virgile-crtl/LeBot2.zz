import PlayerService from '../playerService';
import quit from '../cmd/quit';

jest.mock('../playerService', () => ({
	getInstance: jest.fn(),
}));

describe('quitCommand', () => {
	const guild_id = 'guild1';
	const mockReply = jest.fn();
	const mockInteraction: any = {
	  guildId: guild_id,
	  reply: mockReply,
	};
	const mockPlayer = {
  	stop: jest.fn(),
	};
	const mockPlayerService = {
		getGuildPlayer: jest.fn(() => mockPlayer),
		deleteGuildPlayer: jest.fn(),
	};


	test('Quit', async () => {
		(PlayerService.getInstance as jest.Mock).mockReturnValue(mockPlayerService);

		await quit.execute(mockInteraction);

		expect(PlayerService.getInstance).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.getGuildPlayer).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.getGuildPlayer).toHaveBeenCalledWith(guild_id);
		expect(mockPlayer.stop).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.deleteGuildPlayer).toHaveBeenCalledTimes(1);
		expect(mockPlayerService.deleteGuildPlayer).toHaveBeenCalledWith(guild_id);
		expect(mockReply).toHaveBeenCalledWith('music.leavingChannel');
	});
});

