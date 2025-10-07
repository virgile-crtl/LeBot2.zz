import { AudioPlayer, createAudioPlayer, createAudioResource, CreateVoiceConnectionOptions, getVoiceConnection, joinVoiceChannel, JoinVoiceChannelOptions, VoiceConnection } from "@discordjs/voice";
import DsClient from "../src/dsClient";
import GuildPlayer from "../src/guildPlayer";
import createShuffleStack from "../src/utils/createShuffleStack";
import fs, { stat } from "fs";
import path from "path";

jest.mock('../src/utils/createShuffleStack', () => jest.fn(() => ['track2.mp3', 'track1.mp3', 'track3.mp3']));

describe('GuildPlayer', () => {
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
  } as any;
  const mockConnection: jest.Mocked<VoiceConnection> = {
    subscribe: jest.fn(),
    destroy: jest.fn(),
  } as any;

  beforeAll(() => {
    (createAudioPlayer as jest.Mock).mockReturnValue(mockPlayer);
    (joinVoiceChannel as jest.Mock).mockReturnValue(mockConnection);

    player = new GuildPlayer(guild_id, is_rand, channel_id, dsClient, voiceOption);
    jest.clearAllMocks();
  });

  // beforeEach(() => {
  //   jest.clearAllMocks();
  // });

  test('Create instance', () => {
    expect(new GuildPlayer(guild_id, is_rand, channel_id, dsClient, voiceOption)).toBeInstanceOf(GuildPlayer);
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
  });

  test('Play method', () => {
    const track_name = path.join(process.env.PLAYLISTS_FOLDER!, guild_id, 'track1.mp3');

    player.play(track_name);
    expect(createAudioResource).toHaveBeenCalledTimes(1);
    expect(createAudioResource).toHaveBeenCalledWith(track_name);
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
    expect(mockPlayer.play).toHaveBeenCalledWith(createAudioResource(track_name));
  });

  test('Pause method', () => {
    (mockPlayer.state as any) = { status: 'playing' };

    player.pause();
    expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
  });

  test('Unpause method', () => {
    (mockPlayer.state as any) = { status: 'paused' };

    player.unpause();
    expect(mockPlayer.pause).toHaveBeenCalledTimes(1);
  });

  test('Stop method', () => {
    (getVoiceConnection as jest.Mock).mockReturnValue(mockConnection);

    player.stop();
    expect(mockConnection.destroy).toHaveBeenCalledTimes(1);
  });
});