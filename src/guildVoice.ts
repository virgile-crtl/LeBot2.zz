import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, CreateVoiceConnectionOptions, getVoiceConnection, joinVoiceChannel, JoinVoiceChannelOptions, VoiceConnection } from '@discordjs/voice';
import { Client, TextChannel } from 'discord.js';
import ClientError from './clientError';
import path from 'path';
import { dbClient } from '.';

export default class GuildVoice {
	guildId: string;
	shuffle: boolean;
	channelId: string;
	player: AudioPlayer;
	stack: string[];
	randomStack: string[];

	constructor(guildId: string, shuffle: boolean, channelId: string, dsClient: Client<true>,
		voiceOption: CreateVoiceConnectionOptions & JoinVoiceChannelOptions) {
		this.guildId = guildId;
		this.shuffle = shuffle;
		this.channelId = channelId;
		this.stack = [];
		this.randomStack = this.createRandomStack(guildId);
		try {
			this.player = createAudioPlayer();
			const connection: VoiceConnection = joinVoiceChannel(voiceOption);
			connection.subscribe(this.player);
			this.player.on(AudioPlayerStatus.Idle, () => this.playerIdle(dsClient));
		}
		catch (err) {
			throw ClientError.fromError(err, 'Error lors de la connection au serveur');
		}
	}

	public play(trackPath: string) {
		try {
			this.player.play(createAudioResource(trackPath));
		}
		catch (err) {
			throw ClientError.fromError(err, 'Error lors de la lecture du son');
		}
	}

	public unpause() {
		if (this.player.state.status === AudioPlayerStatus.Playing) {
			throw new ClientError('I am already playing');
		}
		this.player.unpause();
	}

	public pause() {
		if (this.player.state.status === AudioPlayerStatus.Paused) {
			throw new ClientError('I am already paused');
		}
		this.player.pause();
	}

	public stop() {
		const connection = getVoiceConnection(this.guildId);
		if (!connection) throw new ClientError('I am not in this server.');
		connection.destroy();
	}

	public skip(): string | undefined {
		if (this.shuffle) {
			const trackName = this.getNextSong();
			this.play(trackName);
			return path.parse(path.basename(trackName)).name;
		}
		else { this.stop(); }
	}

	public setRandom(random: boolean) {
		this.shuffle = random;
	}

	public addToStack(trackName: string) {
		this.stack.push(trackName);
	}

	private createRandomStack(guildId: string): string[] {
		const songsList = dbClient.getAllTracksFromGuildFolder(guildId);

		for (let i = songsList.length - 1; i > 0; i -= 1) {
			const j = Math.floor(Math.random() * (i + 1));
			[songsList[i], songsList[j]] = [songsList[j], songsList[i]];
		}
		return songsList;
	}

	public getNextSong(): string {
		if (this.stack.length > 0) {
			return path.join(process.env.SONG_FOLDER!, this.guildId, this.stack.shift()! + '.mp3');
		}
		else if (this.randomStack.length > 0) {
			return path.join(process.env.SONG_FOLDER!, this.guildId, this.randomStack.shift()! + '.mp3');
		}
		else {
			this.randomStack = this.createRandomStack(this.guildId);
			return path.join(process.env.SONG_FOLDER!, this.guildId, this.randomStack.shift()! + '.mp3');
		}
	}

	private async checkIfSomeoneIsHere(guildId: string, dsClient: Client<true>): Promise<boolean> {
		const connection = getVoiceConnection(guildId);

		if (!connection) throw new ClientError('I am not in this server.');
		const channel = connection.joinConfig.channelId ? await dsClient.channels.fetch(connection.joinConfig.channelId) : null;
		if (channel?.isVoiceBased() && channel.members.size > 1) { return true; }
		return false;
	}

	private async playerIdle(dsClient: Client<true>) {
		try {
			if (this.shuffle && await this.checkIfSomeoneIsHere(this.guildId, dsClient)) {
			  const songName = this.skip();
				const channel = await dsClient.channels.fetch(this.channelId);
				(channel as TextChannel).send('I am playing ' + songName);
		  }
			else { this.stop(); }
		}
		catch (err) {
			if (err instanceof ClientError) {
				console.info(this.guildId + ' encounter this error ' + err.message);
				const channel = await dsClient.channels.fetch(this.channelId);
				(channel as TextChannel).send(err.message);
			}
			else {
				console.error(err);
				const channel = await dsClient.channels.fetch(this.channelId);
				(channel as TextChannel).send('Unknow Error');
			}
		}
	}
}