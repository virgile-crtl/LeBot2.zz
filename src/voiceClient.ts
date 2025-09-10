import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, CreateVoiceConnectionOptions, getVoiceConnection, joinVoiceChannel, JoinVoiceChannelOptions, VoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction, GuildMember, InteractionReplyOptions, Message } from 'discord.js';
import { dbClient } from './index';
import ClientError from './clientError';
import GuildVoice from './types/guildVoice';
import path from 'path';


class VoiceClient {
  constructor() {}

  public play(interaction: ChatInputCommandInteraction<"cached">, songName: string): AudioPlayer {
    if (!interaction.member || !(interaction.member instanceof GuildMember)  || !interaction.member.voice.channelId)
      throw new ClientError('you need to be in a voice channel to play song.');
    try {
      dbClient.getGuildVoice(interaction.guildId);
    } catch (err) {
      dbClient.deleteGuildVoice(interaction.guildId);
    }
    try {
	    const connection: VoiceConnection = joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });
      const player: AudioPlayer = this.playSong(
        path.join(process.env.SONG_FOLDER!,
        interaction.guildId, songName +'.mp3'), interaction.guildId,
        interaction.followUp.bind(interaction));
      connection.subscribe(player);
      return player;
    } catch (err) {
      if (err instanceof ClientError) throw err;
      throw new ClientError('Error while connecting');
    }
  }

  public unpause(guildId: string) {
    const guildVoice: GuildVoice | undefined = dbClient.getGuildVoice(guildId);
		if (!getVoiceConnection(guildId) || !guildVoice)
      throw new ClientError('I am not playing musique in this server.');
    if (guildVoice.player.state.status === AudioPlayerStatus.Playing)
      throw new ClientError('I am already playing');
		guildVoice.player.unpause();
  }

  public pause(guildId: string) {
    const guildVoice: GuildVoice = dbClient.getGuildVoice(guildId);
		if (!getVoiceConnection(guildId))
      throw new ClientError('I am not playing musique in this server.');
    if (guildVoice.player.state.status === AudioPlayerStatus.Paused)
      throw new ClientError('I am already paused');
		guildVoice.player.pause();
  }


  public stop(guildId: string) {
    const connection = getVoiceConnection(guildId);
		if (!connection) throw new ClientError('I am not in this server.');
		dbClient.deleteGuildVoice(guildId);
		connection.destroy();
  }

  public skip(guildId: string): string{
    const guildVoice: GuildVoice = dbClient.getGuildVoice(guildId);
    if (!getVoiceConnection(guildId))
      throw new ClientError('I am not in this server.');
    const songName: string = dbClient.getNextSong(guildId);
    guildVoice.player.play(createAudioResource(path.join(
      process.env.SONG_FOLDER!, guildId, songName + '.mp3')));
    return songName;
  }

  private playSong(songPath: string, guildId: string, followUp: (options: string | InteractionReplyOptions) => Promise<Message>): AudioPlayer {
    try {
      const player: AudioPlayer = createAudioPlayer();
      player.play(createAudioResource(songPath));
      player.on(AudioPlayerStatus.Idle, () => this.playerIdle(guildId, followUp));
      return player;
    } catch (err) {
      throw new ClientError('Error initializing song');
    }
  }

  private playerIdle(guildId: string, followUp: (options: string | InteractionReplyOptions) => Promise<Message>) {
    try {
      if (dbClient.getShuffle(guildId)) {
			  const songName = this.skip(guildId);
        followUp('I am playing ' + songName);
		  } else {
			  this.stop(guildId);
		  }
    } catch (err) {
      if (err instanceof ClientError) {
				console.info(guildId + ' encounter this error ' + err.message);
        followUp(err.message);
      }
      else {
        console.error(err);
        followUp('Unknow Error');
      }
    }
  }
}

export default new VoiceClient();
