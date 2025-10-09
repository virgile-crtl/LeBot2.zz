import path from 'path';

process.env.PLAYLISTS_FOLDER = path.join(__dirname, 'fixtures', 'playlists');
process.env.NODE_ENV = 'node';

jest.mock('@discordjs/voice', () => ({
	createAudioPlayer: jest.fn(() => ({
		on: jest.fn(),
		play: jest.fn(),
		// stop: jest.fn(),
		// pause: jest.fn(),
		// unpause: jest.fn(),
	})),
	joinVoiceChannel: jest.fn(() => ({
		subscribe: jest.fn(),
		// destroy: jest.fn(),
		// on: jest.fn(),
	})),
	createAudioResource: jest.fn(),
	AudioPlayerStatus: {
		Idle: 'idle',
		Playing: 'playing',
		Paused: 'paused',
	},
	getVoiceConnection: jest.fn(),
	// VoiceConnectionStatus: {
	//   Ready: 'ready',
	//   Disconnected: 'disconnected',
	// },
}));

jest.mock('../i18n', () => ({
	t: jest.fn((key: string) => key),
}));
