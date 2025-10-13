import createShuffleStack from '../utils/createShuffleStack';
import getAllTracksFromGuildFolder from '../utils/getAllTracksFromGuildFolder';

jest.mock('../utils/getAllTracksFromGuildFolder', () => ({
	__esModule: true,
	default: jest.fn(),
}));

describe('createShuffleStack', () => {
	const guild_id = 'guild1';

	test('should return a different order on subsequent calls', () => {
		(getAllTracksFromGuildFolder as jest.Mock).mockReturnValue(['track1', 'track2', 'track3', 'track4', 'track5',
			'track6', 'track7', 'track8', 'track9', 'track10', 'track11', 'track12', 'track13', 'track14', 'track15']);

		const stack1 = createShuffleStack(guild_id);
		const stack2 = createShuffleStack(guild_id);
		expect(stack1).not.toEqual(stack2);
	});
});
