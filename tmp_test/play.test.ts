import { GuildMember } from 'discord.js';
import fs from 'fs';
import getAllTracksFromGuildFolder from '../utils/getAllTracksFromGuildFolder';
import play from '../cmd/play';
import putTrackInPlayer from '../utils/putTrackInPlayer';
import path from 'path';

jest.mock('../utils/getAllTracksFromGuildFolder', () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.mock('../utils/putTrackInPlayer', () => ({
	__esModule: true,
	default: jest.fn(),
}));

describe('playCommand', () => {
	const guild_id = 'guild1';
	const mockInteraction: any = {
	  guildId: guild_id,
		channelId: 'channel1',
	  channel: { isTextBased: () => true },
	  reply: jest.fn(),
		options: {
			getFocused: jest.fn(() => ''),
			getString: jest.fn(() => 'track1'),
		},
		member: {
			voice: {
				channelId: 'voiceChannel1',
			},
		} as GuildMember,
		respond: jest.fn(),
	};

	beforeAll(() => {
		jest.spyOn(console, 'error').mockImplementation(() => {return;});
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		fs.rmSync(process.env.TEST_FOLDER!, { recursive: true, force: true });
	});

	test('Play track', async () => {
		fs.mkdirSync(path.join(process.env.MUSIC_FOLDER!, guild_id), { recursive: true });
		fs.writeFileSync(path.join(process.env.MUSIC_FOLDER!, guild_id, 'track1.mp3'), 'data');
		Object.setPrototypeOf(mockInteraction.member, GuildMember.prototype);

		await play.execute(mockInteraction);
		expect(mockInteraction.options.getString).toHaveBeenCalledTimes(1);
		expect(putTrackInPlayer).toHaveBeenCalledTimes(1);
		expect(putTrackInPlayer).toHaveBeenCalledWith(mockInteraction,
			path.join(process.env.MUSIC_FOLDER!, guild_id),	'track1', expect.any(Function));
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

