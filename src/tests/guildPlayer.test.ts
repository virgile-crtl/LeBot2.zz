import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, CreateVoiceConnectionOptions, getVoiceConnection, joinVoiceChannel, JoinVoiceChannelOptions, VoiceConnection } from '@discordjs/voice';
import { TextChannel } from 'discord.js';
import createShuffleStack from '../utils/createShuffleStack';
import DsClient from '../dsClient';
import GuildPlayer from '../guildPlayer';
import path from 'path';

jest.mock('../utils/createShuffleStack', () => jest.fn(() => ['track2', 'track1', 'track3']));

describe('GuildPlayer', () => {
	const guild_id: string = 'guild1';
	const is_rand: boolean = true;
	const channel_id: string = 'channel1';
	const dsClient: jest.Mocked<DsClient> = {
		channels: {
			fetch: jest.fn(async () => { return mockChannel; }),
		},
		checkIfSomeoneIsHere: jest.fn(),
	} as any as jest.Mocked<DsClient>;
	const voiceOption = {} as CreateVoiceConnectionOptions & JoinVoiceChannelOptions;
	let player: GuildPlayer;
	const mockPlayer: jest.Mocked<AudioPlayer> = {
		on: jest.fn(),
		play: jest.fn(),
		pause: jest.fn(),
		unpause: jest.fn(),
		state: { status: 'idle' } as any,
	} as any as jest.Mocked<AudioPlayer>;
	const mockConnection: jest.Mocked<VoiceConnection> = {
		subscribe: jest.fn(),
		destroy: jest.fn(),
	} as any as jest.Mocked<VoiceConnection>;
	const mockChannel: jest.Mocked<TextChannel> = {
		send: jest.fn(),
	} as any as jest.Mocked<TextChannel>;

	beforeAll(() => {
		(createAudioPlayer as jest.Mock).mockReturnValue(mockPlayer);
		(joinVoiceChannel as jest.Mock).mockReturnValue(mockConnection);

		jest.spyOn(console, 'error').mockImplementation(() => {return;});
		player = new GuildPlayer(guild_id, is_rand, channel_id, dsClient, voiceOption);
		jest.clearAllMocks();
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('Create instance', () => {
		const res: GuildPlayer = new GuildPlayer(guild_id, is_rand, channel_id, dsClient, voiceOption);

		expect(res).toBeInstanceOf(GuildPlayer);
		expect(createShuffleStack).toHaveBeenCalledTimes(1);
		expect(createShuffleStack).toHaveBeenCalledWith(guild_id);
		expect(createAudioPlayer).toHaveBeenCalledTimes(1);
		expect(createAudioPlayer).toHaveBeenCalledWith();
		expect(joinVoiceChannel).toHaveBeenCalledTimes(1);
		expect(joinVoiceChannel).toHaveBeenCalledWith(voiceOption);
		expect(mockConnection.subscribe).toHaveBeenCalledTimes(1);
		expect(mockConnection.subscribe).toHaveBeenCalledWith(mockPlayer);
		expect(mockPlayer.on).toHaveBeenCalledTimes(1);
		expect(mockPlayer.on).toHaveBeenCalledWith('idle', expect.any(Function));

		const callback = (mockPlayer.on as jest.Mock).mock.calls[0][1];
  	const spyIdle = jest.spyOn(res as any, 'playerIdle');
  	callback();
  	expect(spyIdle).toHaveBeenCalledWith(dsClient);
	});

	test('Play method', () => {
		const track_name = path.join(process.env.MUSIC_FOLDER!, guild_id, 'track1.mp3');

		player.play(track_name);
		expect(createAudioResource).toHaveBeenCalledTimes(1);
		expect(createAudioResource).toHaveBeenCalledWith(track_name);
		expect(mockPlayer.play).toHaveBeenCalledTimes(1);
		expect(mockPlayer.play).toHaveBeenCalledWith(createAudioResource(track_name));
	});

	test('Pause method', () => {
		mockPlayer.state = { status: AudioPlayerStatus.Playing } as any;

		player.pause();
		expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
	});

	test('Unpause method', () => {
		mockPlayer.state = { status: AudioPlayerStatus.Paused } as any;

		player.unpause();
		expect(mockPlayer.unpause).toHaveBeenCalledTimes(1);
	});

	test('Stop method', () => {
		(getVoiceConnection as jest.Mock).mockReturnValue(mockConnection);

		player.stop();
		expect(getVoiceConnection).toHaveBeenCalledTimes(1);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect(mockConnection.destroy).toHaveBeenCalledTimes(1);
	});

	test('Skip method when stack is empty and rand is false', () => {
		(player as any)._stack = [];
		(player as any)._is_rand = false;
		const spy = jest.spyOn(player as any, 'stop');

		expect(player.skip()).toBe(undefined);
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('Skip method when stack is empty and rand is true', () => {
		(player as any)._stack = [];
		(player as any)._is_rand = true;
		(player as any)._random_stack = ['track2', 'track1', 'track3'];
		const spyPlay = jest.spyOn(player, 'play');
		const spyGetNext = jest.spyOn(player as any, 'getNextTrack');

		expect(player.skip()).toBe('track2');
		expect((player as any)._random_stack).toEqual(['track1', 'track3']);
		expect(spyGetNext).toHaveBeenCalledTimes(1);
		expect(spyPlay).toHaveBeenCalledTimes(1);
		expect(spyPlay).toHaveBeenCalledWith(path.join(process.env.MUSIC_FOLDER!, guild_id, 'track2.mp3'));
	});

	test('Skip method when stack not empty and rand is true', () => {
		(player as any)._stack = ['track4', 'track5'];
		(player as any)._is_rand = true;
		(player as any)._random_stack = ['track2', 'track1', 'track3'];
		const spyPlay = jest.spyOn(player, 'play');
		const spyGetNext = jest.spyOn(player as any, 'getNextTrack');

		expect(player.skip()).toBe('track4');
		expect((player as any)._stack).toEqual(['track5']);
		expect((player as any)._random_stack).toEqual(['track2', 'track1', 'track3']);
		expect(spyGetNext).toHaveBeenCalledTimes(1);
		expect(spyPlay).toHaveBeenCalledTimes(1);
		expect(spyPlay).toHaveBeenCalledWith(path.join(process.env.MUSIC_FOLDER!, guild_id, 'track4.mp3'));
	});

	test('skip method when stack not empty and rand is false', () => {
		(player as any)._stack = ['track4', 'track5'];
		(player as any)._is_rand = false;
		(player as any)._random_stack = ['track2', 'track1', 'track3'];
		const spyPlay = jest.spyOn(player, 'play');
		const spyGetNext = jest.spyOn(player as any, 'getNextTrack');

		expect(player.skip()).toBe('track4');
		expect((player as any)._stack).toEqual(['track5']);
		expect((player as any)._random_stack).toEqual(['track2', 'track1', 'track3']);
		expect(spyGetNext).toHaveBeenCalledTimes(1);
		expect(spyPlay).toHaveBeenCalledTimes(1);
		expect(spyPlay).toHaveBeenCalledWith(path.join(process.env.MUSIC_FOLDER!, guild_id, 'track4.mp3'));
	});

	test('setRandom method', () => {
		player.setRandom(false);
		expect((player as any)._is_rand).toBe(false);
		player.setRandom(true);
		expect((player as any)._is_rand).toBe(true);
	});

	test('addToStack method', () => {
		(player as any)._random_stack = ['track2', 'track1', 'track3'];
		(player as any)._stack = ['track4', 'track5'];

		player.addToStack('track6');
		expect((player as any)._stack).toEqual(['track4', 'track5', 'track6']);
		expect((player as any)._random_stack).toEqual(['track2', 'track1', 'track3']);
		player.addToStack('track2');
		expect((player as any)._stack).toEqual(['track4', 'track5', 'track6', 'track2']);
		expect((player as any)._random_stack).toEqual(['track1', 'track3']);
	});

	test('updateChannelId method', () => {
		expect((player as any)._channel_id).toBe(channel_id);
		player.updateChannelId('channel2');
		expect((player as any)._channel_id).toBe('channel2');
	});

	test('getNextTrack method when stack not empty', () => {
		(player as any)._stack = ['track4', 'track5'];
		(player as any)._random_stack = ['track2', 'track1', 'track3'];

		expect((player as any).getNextTrack()).toBe(path.join(process.env.MUSIC_FOLDER!, guild_id, 'track4.mp3'));
		expect((player as any)._stack).toEqual(['track5']);
		expect((player as any)._random_stack).toEqual(['track2', 'track1', 'track3']);
	});

	test('getNextTrack method when stack empty and random_stack not empty', () => {
		(player as any)._stack = [];
		(player as any)._random_stack = ['track2', 'track1', 'track3'];

		expect((player as any).getNextTrack()).toBe(path.join(process.env.MUSIC_FOLDER!, guild_id, 'track2.mp3'));
		expect((player as any)._stack).toEqual([]);
		expect((player as any)._random_stack).toEqual(['track1', 'track3']);
	});

	test('getNextTrack method when stack and random_stack empty', () => {
		(player as any)._stack = [];
		(player as any)._random_stack = [];

		expect((player as any).getNextTrack()).toBe(path.join(process.env.MUSIC_FOLDER!, guild_id, 'track2.mp3'));
		expect((player as any)._stack).toEqual([]);
		expect((player as any)._random_stack).toEqual(['track1', 'track3']);
		expect(createShuffleStack).toHaveBeenCalledTimes(1);
		expect(createShuffleStack).toHaveBeenCalledWith(guild_id);
	});

	test('PlayerIdle when nobody is here', async () => {
		(dsClient.checkIfSomeoneIsHere as jest.Mock).mockReturnValueOnce(false);
		const spyStop = jest.spyOn(player, 'stop');

		player.updateChannelId(channel_id);
		await player['playerIdle'](dsClient);
		expect(dsClient.channels.fetch).toHaveBeenCalledTimes(1);
		expect(dsClient.channels.fetch).toHaveBeenCalledWith(channel_id);
		expect(dsClient.checkIfSomeoneIsHere).toHaveBeenCalledTimes(1);
		expect(dsClient.checkIfSomeoneIsHere).toHaveBeenCalledWith(guild_id);
		expect(spyStop).toHaveBeenCalledTimes(1);
		expect(mockChannel.send).toHaveBeenCalledTimes(1);
		expect(mockChannel.send).toHaveBeenCalledWith('music.stopNoUsers');
	});

	test('PlayerIdle when someone is here and skip return undefined', async () => {
		(dsClient.checkIfSomeoneIsHere as jest.Mock).mockReturnValueOnce(true);
		const spySkip = jest.spyOn(player, 'skip');

		(player as any)._is_rand = false;
		(player as any)._stack = [];
		player.updateChannelId(channel_id);
		await player['playerIdle'](dsClient);
		expect(dsClient.channels.fetch).toHaveBeenCalledTimes(1);
		expect(dsClient.channels.fetch).toHaveBeenCalledWith(channel_id);
		expect(dsClient.checkIfSomeoneIsHere).toHaveBeenCalledTimes(1);
		expect(dsClient.checkIfSomeoneIsHere).toHaveBeenCalledWith(guild_id);
		expect(spySkip).toHaveBeenCalledTimes(1);
		expect(mockChannel.send).toHaveBeenCalledTimes(1);
		expect(mockChannel.send).toHaveBeenCalledWith('music.stopNoTracks');
	});

	test('PlayerIdle when someone is here and skip return track', async () => {
		(dsClient.checkIfSomeoneIsHere as jest.Mock).mockReturnValueOnce(true);
		const spySkip = jest.spyOn(player, 'skip');

		(player as any)._is_rand = true;
		(player as any)._stack = [];
		(player as any)._random_stack = ['track2', 'track1'];
		player.updateChannelId(channel_id);
		await player['playerIdle'](dsClient);
		expect(dsClient.channels.fetch).toHaveBeenCalledTimes(1);
		expect(dsClient.channels.fetch).toHaveBeenCalledWith(channel_id);
		expect(dsClient.checkIfSomeoneIsHere).toHaveBeenCalledTimes(1);
		expect(dsClient.checkIfSomeoneIsHere).toHaveBeenCalledWith(guild_id);
		expect(spySkip).toHaveBeenCalledTimes(1);
		expect(mockChannel.send).toHaveBeenCalledTimes(1);
		expect(mockChannel.send).toHaveBeenCalledWith('music.play');
	});
});