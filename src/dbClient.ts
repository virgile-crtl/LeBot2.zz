import { langClient } from '.';
import ClientError from './clientError';
import GuildPlayer from './guildPlayer';
import fs from 'fs';
import path from 'path';

export default class DbClient {
	private _guildsPlayers: Map<string, GuildPlayer>;

	constructor() {
		this._guildsPlayers = new Map();
	}

	public saveGuildPlayer(guild_id: string, guildPlayer: GuildPlayer): void {
		if (this._guildsPlayers.has(guild_id)) { this.deleteGuildPlayer(guild_id); }
		this._guildsPlayers.set(guild_id, guildPlayer);
	}

	public getGuildPlayer(guild_id: string): GuildPlayer {
		if (!this._guildsPlayers.has(guild_id)) {
			throw new ClientError(langClient.t('noMusicSession'));
		}
		return this._guildsPlayers.get(guild_id)!;
	}

	public deleteGuildPlayer(guild_id: string): void {
		this._guildsPlayers.delete(guild_id);
	}

	public getAllTracksFromGuildFolder(guild_id: string): string[] {
		const guild_folder: string = path.join(process.env.PLAYLISTS_FOLDER!, guild_id);
		if (!fs.existsSync(guild_folder)) {
			throw new ClientError(langClient.t('noTracksInServer'));
		}
		const tracks_list: string[] = fs.readdirSync(guild_folder)
			.filter(file => file.endsWith('.mp3'))
			.map(choice => choice.substring(0, choice.length - 4));
		if (tracks_list.length <= 0) {
			throw new ClientError(langClient.t('noTracksInServer'));
		}
		return tracks_list;
	}

	public createShuffleStack(guild_id: string): string[] {
		const tracks_list = this.getAllTracksFromGuildFolder(guild_id);

		for (let i = tracks_list.length - 1; i > 0; i -= 1) {
			const j = Math.floor(Math.random() * (i + 1));
			[tracks_list[i], tracks_list[j]] = [tracks_list[j], tracks_list[i]];
		}
		return tracks_list;
	}
}