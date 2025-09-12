import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, CreateVoiceConnectionOptions, getVoiceConnection, joinVoiceChannel, JoinVoiceChannelOptions, VoiceConnection } from '@discordjs/voice';
import { Client, TextChannel } from 'discord.js';
import { dbClient } from './index';
import ClientError from './clientError';
import path from 'path';


class VoiceClient {
	public play(guildId: string, songPath: string, dsClient: Client<true>,
		voiceOption: CreateVoiceConnectionOptions & JoinVoiceChannelOptions): AudioPlayer {
		try {
			const player: AudioPlayer = createAudioPlayer();
			const connection: VoiceConnection = joinVoiceChannel(voiceOption);
			connection.subscribe(player);
			player.play(createAudioResource(songPath));
			console.log(songPath);
			player.on(AudioPlayerStatus.Idle, () => this.playerIdle(guildId, dsClient));
			return player;
		}
		catch {
			throw new ClientError('Error initializing song');
		}
	}

	public unpause(guildId: string) {
		if (!getVoiceConnection(guildId)) {
			throw new ClientError('I am not playing musique in this server.');
		}
		const player: AudioPlayer = dbClient.getPlayer(guildId);
		if (player.state.status === AudioPlayerStatus.Playing) {
			throw new ClientError('I am already playing');
		}
		player.unpause();
	}

	public pause(guildId: string) {
		if (!getVoiceConnection(guildId)) {
			throw new ClientError('I am not playing musique in this server.');
		}
		const player: AudioPlayer = dbClient.getPlayer(guildId);
		if (player.state.status === AudioPlayerStatus.Paused) {
			throw new ClientError('I am already paused');
		}
		player.pause();
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
		const player: AudioPlayer = dbClient.getPlayer(guildId);
		const songName: string = dbClient.getNextSong(guildId);
		player.play(createAudioResource(songName));
		return path.parse(path.basename(songName)).name;
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
				const channel = await dsClient.channels.fetch(dbClient.getChannelId(guildId));
				(channel as TextChannel).send('I am playing ' + songName);
		  }
			else { this.stop(guildId); }
		}
		catch (err) {
			if (err instanceof ClientError) {
				console.info(guildId + ' encounter this error ' + err.message);
				const channel = await dsClient.channels.fetch(dbClient.getChannelId(guildId));
				(channel as TextChannel).send(err.message);
			}
			else {
				console.error(err);
				const channel = await dsClient.channels.fetch(dbClient.getChannelId(guildId));
				(channel as TextChannel).send('Unknow Error');
			}
		}
	}
}

export default new VoiceClient();
