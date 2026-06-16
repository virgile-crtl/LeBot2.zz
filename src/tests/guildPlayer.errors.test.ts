import { AudioPlayer, createAudioPlayer, createAudioResource, CreateVoiceConnectionOptions, getVoiceConnection, joinVoiceChannel, JoinVoiceChannelOptions, VoiceConnection } from '@discordjs/voice';
import { TextChannel } from 'discord.js';
import ClientError from '../clientError';
import DsClient from '../dsClient';
import GuildPlayer from '../guildPlayer';
import path from 'path';

jest.mock('../utils/createShuffleStack', () => jest.fn(() => ['track2.mp3', 'track1.mp3', 'track3.mp3']));

describe('GuildPlayer Errors', () => {
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
		state: { status: 'idle' },
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

		player = new GuildPlayer(guild_id, is_rand, channel_id, dsClient, voiceOption);
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('Create instance with createAudioPlayer error', () => {
		(createAudioPlayer as jest.Mock).mockImplementationOnce(() => {
			throw new Error('Test error');
		});

		expect(() => new GuildPlayer('guild1', true, 'channel1', {} as DsClient, {} as CreateVoiceConnectionOptions & JoinVoiceChannelOptions)).toThrow('errors.music.connectError\nTest error');
		expect(createAudioPlayer).toHaveBeenCalledTimes(1);
		expect(createAudioPlayer).toHaveBeenCalledWith();
		expect(joinVoiceChannel).not.toHaveBeenCalled();
	});

	test('Create instance with joinVoiceChannel error', () => {
		(joinVoiceChannel as jest.Mock).mockImplementationOnce(() => {
			throw new Error('Test error');
		});

		expect(() => new GuildPlayer('guild1', true, 'channel1', {} as DsClient, voiceOption)).toThrow('errors.music.connectError\nTest error');
		expect(createAudioPlayer).toHaveBeenCalledTimes(1);
		expect(createAudioPlayer).toHaveBeenCalledWith();
		expect(joinVoiceChannel).toHaveBeenCalledTimes(1);
		expect(joinVoiceChannel).toHaveBeenCalledWith(voiceOption);
	});

	test('Create instance with connection.subscribe error', () => {
		mockConnection.subscribe.mockImplementationOnce(() => {
			throw new Error('Test error');
		});

		expect(() => new GuildPlayer('guild1', true, 'channel1', {} as DsClient, voiceOption)).toThrow('errors.music.connectError\nTest error');
		expect(createAudioPlayer).toHaveBeenCalledTimes(1);
		expect(createAudioPlayer).toHaveBeenCalledWith();
		expect(joinVoiceChannel).toHaveBeenCalledTimes(1);
		expect(joinVoiceChannel).toHaveBeenCalledWith(voiceOption);
		expect(mockConnection.subscribe).toHaveBeenCalledTimes(1);
		expect(mockConnection.subscribe).toHaveBeenCalledWith(mockPlayer);
	});

	test('Create instance with player.on error', () => {
		mockPlayer.on.mockImplementationOnce(() => {
			throw new Error('Test error');
		});

		expect(() => new GuildPlayer('guild1', true, 'channel1', {} as DsClient, voiceOption)).toThrow('errors.music.connectError\nTest error');
		expect(createAudioPlayer).toHaveBeenCalledTimes(1);
		expect(createAudioPlayer).toHaveBeenCalledWith();
		expect(joinVoiceChannel).toHaveBeenCalledTimes(1);
		expect(joinVoiceChannel).toHaveBeenCalledWith(voiceOption);
		expect(mockConnection.subscribe).toHaveBeenCalledTimes(1);
		expect(mockConnection.subscribe).toHaveBeenCalledWith(mockPlayer);
		expect(mockPlayer.on).toHaveBeenCalledTimes(1);
		expect(mockPlayer.on).toHaveBeenCalledWith('idle', expect.any(Function));
	});

	test('Play method with createAudioResource error', () => {
		(createAudioResource as jest.Mock).mockImplementationOnce(() => {
			throw new Error('Test error');
		});
		const track_name = path.join(process.env.MUSIC_FOLDER!, guild_id, 'track1.mp3');

		expect(() => player.play(track_name)).toThrow('errors.music.playError\nTest error');
		expect(createAudioResource).toHaveBeenCalledTimes(1);
		expect(createAudioResource).toHaveBeenCalledWith(track_name);
	});

	test('Play method with player.play error', () => {
		mockPlayer.play.mockImplementationOnce(() => {
			throw new Error('Test error');
		});
		const track_name = path.join(process.env.MUSIC_FOLDER!, guild_id, 'track1.mp3');

		expect(() => player.play(track_name)).toThrow('errors.music.playError\nTest error');
		expect(createAudioResource).toHaveBeenCalledTimes(1);
		expect(createAudioResource).toHaveBeenCalledWith(track_name);
		expect(mockPlayer.play).toHaveBeenCalledTimes(1);
		expect(mockPlayer.play).toHaveBeenCalledWith(createAudioResource(track_name));
	});

	test('Unpause method with already playing', () => {
		(player as any)._player.state.status = 'playing';

		expect(() => player.unpause()).toThrow('music.alreadyPlay');
		expect(mockPlayer.unpause).not.toHaveBeenCalled();
	});

	test('Unpause method with player.unpause error', () => {
		(player as any)._player.state.status = 'paused';
		mockPlayer.unpause.mockImplementationOnce(() => {
			throw new Error('Test error');
		});

		expect(() => player.unpause()).toThrow('errors.music.unpauseError\nTest error');
		expect(mockPlayer.unpause).toHaveBeenCalledTimes(1);
	});

	test('Pause method with already paused', () => {
		(player as any)._player.state.status = 'paused';

		expect(() => player.pause()).toThrow('music.alreadyPause');
		expect(mockPlayer.pause).not.toHaveBeenCalled();
	});

	test('Pause method with player.pause error', () => {
		(player as any)._player.state.status = 'playing';
		mockPlayer.pause.mockImplementationOnce(() => {
			throw new Error('Test error');
		});

		expect(() => player.pause()).toThrow('errors.music.pauseError\nTest error');
		expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
	});

	test('Stop method with no connection', () => {
		(getVoiceConnection as jest.Mock).mockReturnValueOnce(undefined);

		expect(() => player.stop()).toThrow('errors.music.notInServer');
	});

	test('Stop method with connection.destroy error', () => {
		(getVoiceConnection as jest.Mock).mockReturnValueOnce(mockConnection);
		mockConnection.destroy.mockImplementationOnce(() => {
			throw new Error('Test error');
		});

		expect(() => player.stop()).toThrow('errors.music.stopError\nTest error');
		expect(mockConnection.destroy).toHaveBeenCalledTimes(1);
	});

	test('PlayerIdle catch error', async () => {
		const spy = jest.spyOn(console, 'error').mockImplementation(() => {return;});
		(dsClient.checkIfSomeoneIsHere as jest.Mock).mockImplementationOnce(() => {
			throw new Error('Test error');
		});

		await player['playerIdle'](dsClient);
		expect(dsClient.channels.fetch).toHaveBeenCalledWith(channel_id);
		expect(dsClient.channels.fetch).toHaveBeenCalledTimes(2);
		expect(dsClient.checkIfSomeoneIsHere).toHaveBeenCalledTimes(1);
		expect(dsClient.checkIfSomeoneIsHere).toHaveBeenCalledWith(guild_id);
		expect(mockChannel.send).toHaveBeenCalledTimes(1);
		expect(mockChannel.send).toHaveBeenCalledWith('errors.uknError');
		expect(console.error).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});

	test('PlayerIdle catch error', async () => {
		const spy = jest.spyOn(console, 'error').mockImplementation(() => {return;});
		(dsClient.checkIfSomeoneIsHere as jest.Mock).mockImplementationOnce(() => {
			throw new ClientError('Test error');
		});

		await player['playerIdle'](dsClient);
		expect(dsClient.channels.fetch).toHaveBeenCalledWith(channel_id);
		expect(dsClient.channels.fetch).toHaveBeenCalledTimes(2);
		expect(dsClient.checkIfSomeoneIsHere).toHaveBeenCalledTimes(1);
		expect(dsClient.checkIfSomeoneIsHere).toHaveBeenCalledWith(guild_id);
		expect(mockChannel.send).toHaveBeenCalledTimes(1);
		expect(mockChannel.send).toHaveBeenCalledWith('Test error');
		expect(console.error).toHaveBeenCalledTimes(1);
		spy.mockRestore();
	});
});