import { AudioPlayerStatus, joinVoiceChannel, VoiceConnection, createAudioResource, AudioPlayer, createAudioPlayer, AudioResource, CreateVoiceConnectionOptions, JoinVoiceChannelOptions } from "@discordjs/voice";

export default class VoiceClient {
  connection: VoiceConnection;
  player: AudioPlayer;
  song: AudioResource;

  constructor(options: CreateVoiceConnectionOptions & JoinVoiceChannelOptions, songPath: string) {
    this.connection = joinVoiceChannel(options);
    this.player = createAudioPlayer();
    this.song = createAudioResource(songPath);;
    this.player.play(this.song);
    this.connection.subscribe(this.player);
    this.player.on(AudioPlayerStatus.Idle, () => {
      this.connection.destroy();
    });
  }
}