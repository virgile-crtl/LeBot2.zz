import { CreateVoiceConnectionOptions, JoinVoiceChannelOptions } from '@discordjs/voice';
import { t } from './i18next';
import ClientError from './clientError';
import GuildPlayer from './guildPlayer';
import DsClient from './dsClient';

export default class PlayerService {
	private static _instance: PlayerService;
	private _guildsPlayers: Map<string, GuildPlayer>;

	constructor() {
		this._guildsPlayers = new Map();
	}

	public static getInstance(): PlayerService {
	  if (!PlayerService._instance) {
	    PlayerService._instance = new PlayerService();
	  }
		return PlayerService._instance;
	}

	public createGuildPlayer(guild_id: string, track_name: string, is_rand: boolean,
		channel_id: string, dsClient: DsClient, voiceOption: CreateVoiceConnectionOptions & JoinVoiceChannelOptions): void {
		const guildPlayer = new GuildPlayer(guild_id, is_rand, channel_id, dsClient, voiceOption);
		guildPlayer.play(track_name);
		this.saveGuildPlayer(guild_id, guildPlayer);
	}

	public updatePlayer(track_name: string, guild_id: string,
		channel_id: string, is_rand: boolean | null): void {
		const guildPlayer = this.getGuildPlayer(guild_id);
		guildPlayer.addToStack(track_name);
		guildPlayer.updateChannelId(channel_id);
		if (is_rand != null) guildPlayer.setRandom(is_rand);
	}

	public saveGuildPlayer(guild_id: string, guildPlayer: GuildPlayer): void {
		if (this._guildsPlayers.has(guild_id)) { this.deleteGuildPlayer(guild_id); }
		this._guildsPlayers.set(guild_id, guildPlayer);
	}

	public getGuildPlayer(guild_id: string): GuildPlayer {
		if (!this._guildsPlayers.has(guild_id)) {
			throw new ClientError(t('noMusicSession'));
		}
		return this._guildsPlayers.get(guild_id)!;
	}

	public deleteGuildPlayer(guild_id: string): void {
		this._guildsPlayers.delete(guild_id);
	}
}