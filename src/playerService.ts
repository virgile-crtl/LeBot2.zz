import { t } from './i18n';
import ClientError from './clientError';
import GuildPlayer from './guildPlayer';

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