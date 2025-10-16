import downloadTrack from '../utils/downloads';
import fs from 'fs';
import add from '../cmd/add';
import putTrackInPlayer from '../utils/putTrackInPlayer';
import path from 'path';


jest.mock('../utils/putTrackInPlayer', () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.mock('../utils/downloads', () => ({
	__esModule: true,
	default: jest.fn(),
}));

describe('addCommand', () => {
	const guild_id = 'guild1';
	const track_name = 'track1';
	const mockInteraction: any = {
	  guildId: guild_id,
		options: {
			getBoolean: jest.fn(() => null),
			getString: jest.fn(() => 'http://example.com/track.mp3'),
			getAttachment: jest.fn(() => 'attachment1'),
		},
		reply: jest.fn(),
		editReply: jest.fn(),
		followUp: jest.fn(),
	};


	beforeAll(() => {
		fs.rmSync(process.env.TEST_FOLDER!, { recursive: true, force: true });
		jest.spyOn(console, 'error').mockImplementation(() => {return;});
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		fs.rmSync(process.env.TEST_FOLDER!, { recursive: true, force: true });
	});

	test('Add track without guild folder and play false', async () => {
		fs.mkdirSync(process.env.PLAYLISTS_FOLDER!, { recursive: true });
		(downloadTrack as jest.Mock).mockResolvedValue(track_name);
		mockInteraction.options.getBoolean.mockReturnValue(false);

		await add.execute(mockInteraction);
		expect(fs.existsSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id))).toBe(true);
		expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
		expect(mockInteraction.reply).toHaveBeenCalledWith('music.startDownload');
		expect(downloadTrack).toHaveBeenCalledTimes(1);
		expect(downloadTrack).toHaveBeenCalledWith(path.join(process.env.PLAYLISTS_FOLDER!, guild_id), mockInteraction.options.getString('url'), mockInteraction.options.getAttachment('track'));
		expect(mockInteraction.editReply).toHaveBeenCalledTimes(1);
		expect(mockInteraction.editReply).toHaveBeenCalledWith('music.downloadCompleted');
		expect(putTrackInPlayer).toHaveBeenCalledTimes(0);
	});

	test('Add track without guild folder and play true', async () => {
		fs.mkdirSync(process.env.PLAYLISTS_FOLDER!, { recursive: true });
		(downloadTrack as jest.Mock).mockResolvedValue(track_name);
		mockInteraction.options.getBoolean.mockReturnValue(true);

		await add.execute(mockInteraction);
		expect(fs.existsSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id))).toBe(true);
		expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
		expect(mockInteraction.reply).toHaveBeenCalledWith('music.startDownload');
		expect(downloadTrack).toHaveBeenCalledTimes(1);
		expect(downloadTrack).toHaveBeenCalledWith(path.join(process.env.PLAYLISTS_FOLDER!, guild_id), mockInteraction.options.getString('url'), mockInteraction.options.getAttachment('track'));
		expect(mockInteraction.editReply).toHaveBeenCalledTimes(1);
		expect(mockInteraction.editReply).toHaveBeenCalledWith('music.downloadCompleted');
		expect(putTrackInPlayer).toHaveBeenCalledTimes(1);
		expect(putTrackInPlayer).toHaveBeenCalledWith(
			mockInteraction,
			path.join(process.env.PLAYLISTS_FOLDER!, guild_id),
			track_name,
			expect.any(Function),
		);
	});

	test('Add track with guild folder and to_queue not set', async () => {
		fs.mkdirSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id), { recursive: true });
		(downloadTrack as jest.Mock).mockResolvedValue(track_name);
		mockInteraction.options.getBoolean.mockReturnValue(null);

		await add.execute(mockInteraction);
		expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
		expect(mockInteraction.reply).toHaveBeenCalledWith('music.startDownload');
		expect(downloadTrack).toHaveBeenCalledTimes(1);
		expect(downloadTrack).toHaveBeenCalledWith(path.join(process.env.PLAYLISTS_FOLDER!, guild_id), mockInteraction.options.getString('url'), mockInteraction.options.getAttachment('track'));
		expect(mockInteraction.editReply).toHaveBeenCalledTimes(1);
		expect(mockInteraction.editReply).toHaveBeenCalledWith('music.downloadCompleted');
		expect(putTrackInPlayer).toHaveBeenCalledTimes(1);
		expect(putTrackInPlayer).toHaveBeenCalledWith(
			mockInteraction,
			path.join(process.env.PLAYLISTS_FOLDER!, guild_id),
			track_name,
			expect.any(Function),
		);
	});

	test('Add track with guild folder and play true', async () => {
		fs.mkdirSync(path.join(process.env.PLAYLISTS_FOLDER!, guild_id), { recursive: true });
		(downloadTrack as jest.Mock).mockResolvedValue(track_name);
		mockInteraction.options.getBoolean.mockReturnValue(true);

		await add.execute(mockInteraction);
		expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
		expect(mockInteraction.reply).toHaveBeenCalledWith('music.startDownload');
		expect(downloadTrack).toHaveBeenCalledTimes(1);
		expect(downloadTrack).toHaveBeenCalledWith(path.join(process.env.PLAYLISTS_FOLDER!, guild_id), mockInteraction.options.getString('url'), mockInteraction.options.getAttachment('track'));
		expect(mockInteraction.editReply).toHaveBeenCalledTimes(1);
		expect(mockInteraction.editReply).toHaveBeenCalledWith('music.downloadCompleted');
		expect(putTrackInPlayer).toHaveBeenCalledTimes(1);
		expect(putTrackInPlayer).toHaveBeenCalledWith(
			mockInteraction,
			path.join(process.env.PLAYLISTS_FOLDER!, guild_id),
			track_name,
			expect.any(Function),
		);
	});
});

