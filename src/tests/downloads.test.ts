import downloadTrack from '../utils/downloads';
import path from 'path';
import fs from 'fs';
import https from 'https';

jest.mock('fs', () => ({
	...jest.requireActual('fs'),
	createWriteStream: jest.fn(),
}));

jest.mock('https', () => ({
	get: jest.fn().mockReturnValue({ on: jest.fn() }),
}));

describe('downloadTrack', () => {
	const guild_id = 'guild1';
	const guild_folder = path.join(process.env.PLAYLISTS_FOLDER!, guild_id);

	test('No URL and no attachment', async () => {
		await expect(downloadTrack('tests', null, null)).rejects.toThrow('errors.music.paramError');
	});

	test('download from Attachment', async () => {
		const attachment = {
			name: 'test.mp3',
			url: 'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3',
		} as any;
		fs.mkdirSync(guild_folder, { recursive: true });

		const mockPipe = jest.fn().mockReturnThis();
  	const mockOn = jest.fn().mockImplementation((event, callback) => {
    	if (event === 'finish') callback();
    	return { on: mockOn };
  	});
  	const mockResponse = {
  	  pipe: jest.fn().mockReturnThis(),
  	  on: jest.fn().mockImplementation((event, callback) => {
				if (event === 'finish') callback();
				return { on: mockOn };
  	};
	  const mockWriteStream = {
  	  on: jest.fn((event, cb) => {
	      if (event === 'finish') cb();
      	return mockWriteStream;
	    }),
    	close: jest.fn(cb => cb && cb()),
  	};

  	(https.get as jest.Mock).mockImplementation((url, callback) => {
    	callback(mockResponse);
    	return { on: jest.fn() };
  	});

		expect(await downloadTrack(path.join(process.env.PLAYLISTS_FOLDER!, guild_id), null, attachment)).toBe('test');
		expect(fs.createWriteStream).toHaveBeenCalledTimes(1);
		expect(fs.createWriteStream).toHaveBeenCalledWith(path.join(guild_folder, attachment.name));
		expect(https.get).toHaveBeenCalledTimes(1);
		expect(https.get).toHaveBeenCalledWith(attachment.url, expect.any(Function));
	});
});