import downloadTrack from '../utils/downloads';
import path from 'path';
import fs from 'fs';
import https from 'https';
import ytdl from 'youtube-dl-exec';

jest.mock('fs', () => ({
	...jest.requireActual('fs'),
	createWriteStream: jest.fn(),
}));

jest.mock('https', () => ({
	get: jest.fn().mockReturnValue({ on: jest.fn() }),
}));

jest.mock('youtube-dl-exec');

describe('downloadTrack', () => {
	const guild_id = 'guild1';
	const guild_folder = path.join(process.env.MUSIC_FOLDER!, guild_id);
	const mockWriteStream = {
  	on: jest.fn().mockReturnThis(),
  	close: jest.fn((cb: any) => cb && cb()),
	};
	const attachment = {
		name: 'test.mp3',
		url: 'https://fakeurl/file.mp3',
	} as any;

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('No URL and no attachment', async () => {
		await expect(downloadTrack('tests', null, null)).rejects.toThrow('errors.music.paramError');
	});

	test('Error in download', async () => {
		(ytdl as any as jest.Mock).mockReturnValue('error');
		await expect(downloadTrack('tests', 'https://youtube.com/fakevideo', null)).rejects.toThrow('errors.music.downloadError');
	});

	test('download from Attachment', async () => {
		fs.mkdirSync(guild_folder, { recursive: true });
		const fakeResponse = {
  	  pipe: jest.fn(() => ({
  	    on: jest.fn((event: string, cb: any) => {
  	      if (event === 'finish') cb();
  	      return mockWriteStream;
  	    }),
  	  })),
  	};
		(fs.createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);
		(https.get as jest.Mock).mockImplementation((url, callback) => {
  	  callback(fakeResponse);
  	  return { on: jest.fn() };
  	});

		expect(await downloadTrack(path.join(process.env.MUSIC_FOLDER!, guild_id), null, attachment)).toBe('test');
		expect(fs.createWriteStream).toHaveBeenCalledTimes(1);
		expect(fs.createWriteStream).toHaveBeenCalledWith(path.join(guild_folder, attachment.name));
		expect(https.get).toHaveBeenCalledTimes(1);
		expect(https.get).toHaveBeenCalledWith(attachment.url, expect.any(Function));
	});

	test('download from Youtube URL', async () => {
		fs.mkdirSync(guild_folder, { recursive: true });
		(ytdl as any as jest.Mock).mockReturnValue({ title: 'faketrack' });

		expect(await downloadTrack(path.join(process.env.MUSIC_FOLDER!, guild_id), 'https://youtube.com/fakevideo', null)).toBe('faketrack');
		expect(ytdl).toHaveBeenCalledTimes(2);
		expect(ytdl).toHaveBeenNthCalledWith(1, 'https://youtube.com/fakevideo', {
			noPlaylist: true,
			dumpSingleJson: true,
		});
		expect(ytdl).toHaveBeenNthCalledWith(2, 'https://youtube.com/fakevideo', {
			noPlaylist: true,
			extractAudio: true,
			audioFormat: 'mp3',
			output: path.join(guild_folder, 'faketrack.mp3'),
		});
	});
});