import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, CreateVoiceConnectionOptions, getVoiceConnection, joinVoiceChannel, JoinVoiceChannelOptions, VoiceConnection } from '@discordjs/voice';
import { Channel, GuildTextBasedChannel, TextChannel } from 'discord.js';
import { dbClient, langClient } from './index';
import ClientError from './clientError';
import DsClient from './dsClient';
import path from 'path';

export default class GuildPlayer {
	private _guild_id: string;
	private _is_rand: boolean;
	private _channel_id: string;
	private _player: AudioPlayer;
	private _stack: string[];
	private _random_stack: string[];

	constructor(guild_id: string, is_rand: boolean, channel_id: string, dsClient: DsClient,
		voiceOption: CreateVoiceConnectionOptions & JoinVoiceChannelOptions) {
		this._guild_id = guild_id;
		this._is_rand = is_rand;
		this._channel_id = channel_id;
		this._stack = [];
		this._random_stack = dbClient.createShuffleStack(guild_id);
		try {
			this._player = createAudioPlayer();
			const connection: VoiceConnection = joinVoiceChannel(voiceOption);
			connection.subscribe(this._player);
			this._player.on(AudioPlayerStatus.Idle, () => this.playerIdle(dsClient));
		}
		catch (err) {
			throw ClientError.fromError(err, langClient.t('connectError'));
		}
	}

	public play(track_path: string): void {
		try {
			this._player.play(createAudioResource(track_path));
		}
		catch (err) {
			throw ClientError.fromError(err, langClient.t('playError'));
		}
	}

	public unpause(): void {
		if (this._player.state.status === AudioPlayerStatus.Playing) {
			throw new ClientError(langClient.t('alreadyPlay'));
		}
		this._player.unpause();
	}

	public pause(): void {
		if (this._player.state.status === AudioPlayerStatus.Paused) {
			throw new ClientError(langClient.t('alreadyPause'));
		}
		this._player.pause();
	}

	public stop(): void {
		const connection: VoiceConnection | undefined = getVoiceConnection(this._guild_id);
		if (!connection) throw new ClientError(langClient.t('notInServer'));
		connection.destroy();
	}

	public skip(): string | undefined {
		if (this._is_rand || this._stack.length > 0) {
			const track_name: string = this.getNextTrack();
			this.play(track_name);
			return path.parse(path.basename(track_name)).name;
		}
		else { this.stop(); }
	}

	public setRandom(is_rand: boolean): void {
		this._is_rand = is_rand;
	}

	public addToStack(track_name: string): void {
		this._random_stack.filter(track => track != track_name);
		this._stack.push(track_name);
	}

	public updateChannelId(channel_id: string, channel: GuildTextBasedChannel | null): void {
		if (!channel || !channel.isTextBased()) {
			throw new ClientError(langClient.t('commandInTextChannel'));
		}
		this._channel_id = channel_id;
	}

	private getNextTrack(): string {
		if (this._stack.length > 0) {
			return path.join(process.env.PLAYLISTS_FOLDER!, this._guild_id, this._stack.shift()! + '.mp3');
		}
		else if (this._random_stack.length > 0) {
			return path.join(process.env.PLAYLISTS_FOLDER!, this._guild_id, this._random_stack.shift()! + '.mp3');
		}
		else {
			this._random_stack = dbClient.createShuffleStack(this._guild_id);
			return path.join(process.env.PLAYLISTS_FOLDER!, this._guild_id, this._random_stack.shift()! + '.mp3');
		}
	}

	private async playerIdle(dsClient: DsClient): Promise<void> {
		try {
			const channel: Channel | null = await dsClient.channels.fetch(this._channel_id);
			if (await dsClient.checkIfSomeoneIsHere(this._guild_id)) {
			  const track_name: string | undefined = this.skip();
				if (track_name) { await (channel as TextChannel).send(langClient.t('play', { trackName: track_name })); }
				else { await (channel as TextChannel).send(langClient.t('stopNoTracks')); }
		  }
			else {
				this.stop();
				await (channel as TextChannel).send(langClient.t('stopNoUsers'));
			}
		}
		catch (err) {
			const channel: Channel | null = await dsClient.channels.fetch(this._channel_id);
			if (err instanceof ClientError) {
				(channel as TextChannel).send(err.message.split(/[\n]/)[0]);
			}
			else { (channel as TextChannel).send(langClient.t('uknError')); }
			console.error(err);
		}
	}
}