import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, createAudioResource, CreateVoiceConnectionOptions, joinVoiceChannel, JoinVoiceChannelOptions, VoiceConnection } from "@discordjs/voice";
import DsClient from "../src/dsClient";
import GuildPlayer from "../src/guildPlayer";
import path from "path";

jest.mock('../src/utils/createShuffleStack', () => jest.fn(() => ['track2.mp3', 'track1.mp3', 'track3.mp3']));

describe('GuildPlayer Errors', () => {
  const guild_id: string = 'guild1';
  const is_rand: boolean = true;
  const channel_id: string = 'channel1';
  const dsClient = {} as DsClient;
  const voiceOption = {} as CreateVoiceConnectionOptions & JoinVoiceChannelOptions;
  let player: GuildPlayer;
  const mockPlayer: jest.Mocked<AudioPlayer> = {
    on: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    unpause: jest.fn(),
    state: { status: 'idle' }
  } as any;

  const mockConnection: jest.Mocked<VoiceConnection> = {
    subscribe: jest.fn(),
  } as any;

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

    expect(() => new GuildPlayer('guild1', true, 'channel1', {} as DsClient, {} as CreateVoiceConnectionOptions & JoinVoiceChannelOptions)).toThrow('connectError\nTest error');
    expect(createAudioPlayer).toHaveBeenCalledTimes(1);
    expect(createAudioPlayer).toHaveBeenCalledWith();
    expect(joinVoiceChannel).not.toHaveBeenCalled();
  });

  test('Create instance with joinVoiceChannel error', () => {
    (joinVoiceChannel as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    expect(() => new GuildPlayer('guild1', true, 'channel1', {} as DsClient, voiceOption)).toThrow('connectError\nTest error');
    expect(createAudioPlayer).toHaveBeenCalledTimes(1);
    expect(createAudioPlayer).toHaveBeenCalledWith();
    expect(joinVoiceChannel).toHaveBeenCalledTimes(1);
    expect(joinVoiceChannel).toHaveBeenCalledWith(voiceOption);
  });

  test('Create instance with connection.subscribe error', () => {
    mockConnection.subscribe.mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    expect(() => new GuildPlayer('guild1', true, 'channel1', {} as DsClient, voiceOption)).toThrow('connectError\nTest error');
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

    expect(() => new GuildPlayer('guild1', true, 'channel1', {} as DsClient, voiceOption)).toThrow('connectError\nTest error');
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
    const track_name = path.join(process.env.PLAYLISTS_FOLDER!, guild_id, 'track1.mp3');

    expect(() => player.play(track_name)).toThrow('playError\nTest error');
    expect(createAudioResource).toHaveBeenCalledTimes(1);
    expect(createAudioResource).toHaveBeenCalledWith(track_name);
  });

  test('Play method with player.play error', () => {
    mockPlayer.play.mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    const track_name = path.join(process.env.PLAYLISTS_FOLDER!, guild_id, 'track1.mp3');

    expect(() => player.play(track_name)).toThrow('playError\nTest error');
    expect(createAudioResource).toHaveBeenCalledTimes(1);
    expect(createAudioResource).toHaveBeenCalledWith(track_name);
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
    expect(mockPlayer.play).toHaveBeenCalledWith(createAudioResource(track_name));
  });

  test('Unpause method with already playing', () => {
    (mockPlayer.state as any) = { status: AudioPlayerStatus.Playing };

    expect(() => player.unpause()).toThrow('alreadyPlay');
    expect(mockPlayer.unpause).not.toHaveBeenCalled();
  });
});