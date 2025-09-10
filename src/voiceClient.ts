import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel, VoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction, Client, GuildMember, TextChannel } from 'discord.js';
import { dbClient } from './index';
import ClientError from './clientError';
import GuildVoice from './types/guildVoice';
import path from 'path';


class VoiceClient {
	public play(interaction: ChatInputCommandInteraction<'cached'>, songName: string): AudioPlayer {
		if (!interaction.member || !(interaction.member instanceof GuildMember) || !interaction.member.voice.channelId) {
			throw new ClientError('you need to be in a voice channel to play song.');
		}
		if (!interaction.channel || !interaction.channel.isTextBased()) {
			throw new ClientError('you need to make the command in a Text channel to play song.');
		}
		try {
			dbClient.getGuildVoice(interaction.guildId);
		}
		catch {
			dbClient.deleteGuildVoice(interaction.guildId);
		}
		try {
	    const connection: VoiceConnection = joinVoiceChannel({
				channelId: interaction.member.voice.channelId,
				guildId: interaction.guildId,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			});
			const player: AudioPlayer = this.playSong(
				path.join(process.env.SONG_FOLDER!, interaction.guildId,
					songName + '.mp3'), interaction.guildId, interaction.client);
			connection.subscribe(player);
			return player;
		}
		catch (err) {
			if (err instanceof ClientError) throw err;
			throw new ClientError('Error while connecting');
		}
	}

	public unpause(guildId: string) {
		const guildVoice: GuildVoice | undefined = dbClient.getGuildVoice(guildId);
		if (!getVoiceConnection(guildId) || !guildVoice) {
			throw new ClientError('I am not playing musique in this server.');
		}
		if (guildVoice.player.state.status === AudioPlayerStatus.Playing) {
			throw new ClientError('I am already playing');
		}
		guildVoice.player.unpause();
	}

	public pause(guildId: string) {
		const guildVoice: GuildVoice = dbClient.getGuildVoice(guildId);
		if (!getVoiceConnection(guildId)) {
			throw new ClientError('I am not playing musique in this server.');
		}
		if (guildVoice.player.state.status === AudioPlayerStatus.Paused) {
			throw new ClientError('I am already paused');
		}
		guildVoice.player.pause();
	}


	public stop(guildId: string) {
		const connection = getVoiceConnection(guildId);
		if (!connection) throw new ClientError('I am not in this server.');
		dbClient.deleteGuildVoice(guildId);
		connection.destroy();
	}

	public skip(guildId: string): string {
		if (!getVoiceConnection(guildId)) {
			throw new ClientError('I am not in this server.');
		}
		const guildVoice: GuildVoice = dbClient.getGuildVoice(guildId);
		const songName: string = dbClient.getNextSong(guildId);
		guildVoice.player.play(createAudioResource(path.join(
      process.env.SONG_FOLDER!, guildId, songName + '.mp3')));
		return songName;
	}

	private playSong(songPath: string, guildId: string, dsClient: Client<true>): AudioPlayer {
		try {
			const player: AudioPlayer = createAudioPlayer();
			player.play(createAudioResource(songPath));
			player.on(AudioPlayerStatus.Idle, () => this.playerIdle(guildId, dsClient));
			return player;
		}
		catch {
			throw new ClientError('Error initializing song');
		}
	}

	private async checkIfSomeoneIsHere(guildId: string, dsClient: Client<true>): Promise<boolean> {
		const connection = getVoiceConnection(guildId);

		if (!connection) throw new ClientError('I am not in this server.');
		const channel = connection.joinConfig.channelId ? await dsClient.channels.fetch(connection.joinConfig.channelId) : null;
		if (channel?.isVoiceBased() && channel.members.size > 1) { return true; }
		return false;
	}

	private async playerIdle(guildId: string, dsClient: Client<true>) {
		try {
			if (dbClient.getShuffle(guildId) && await this.checkIfSomeoneIsHere(guildId, dsClient)) {
			  const songName = this.skip(guildId);
				const channel = await dsClient.channels.fetch(dbClient.getChannnelId(guildId));
				(channel as TextChannel).send('I am playing ' + songName);
		  }
			else { this.stop(guildId); }
		}
		catch (err) {
			if (err instanceof ClientError) {
				console.info(guildId + ' encounter this error ' + err.message);
				const channel = await dsClient.channels.fetch(dbClient.getChannnelId(guildId));
				(channel as TextChannel).send(err.message);
			}
			else {
				console.error(err);
				const channel = await dsClient.channels.fetch(dbClient.getChannnelId(guildId));
				(channel as TextChannel).send('Unknow Error');
			}
		}
	}
}

export default new VoiceClient();
