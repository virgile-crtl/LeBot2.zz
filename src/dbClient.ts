import ClientError from './clientError';
import GuildVoice from './guildVoice';
import fs from 'fs';
import path from 'path';

export default class DbClient {
	private guildsVoices: Map<string, GuildVoice>;

	constructor() {
		this.guildsVoices = new Map();
	}

	public saveGuildVoice(guildId: string, guildVoice: GuildVoice): void {
		if (this.guildsVoices.has(guildId)) { this.deleteGuildVoice(guildId); }
		this.guildsVoices.set(guildId, guildVoice);
	}

	public guildVoiceExist(guildId: string) {
		return this.guildsVoices.has(guildId);
	}

	public getGuildVoice(guildId: string): GuildVoice {
		if (!this.guildsVoices.has(guildId)) {
			throw new ClientError('I didn\'t find your Musique session');
		}
		return this.guildsVoices.get(guildId)!;
	}

	public deleteGuildVoice(guildId: string) {
		this.guildsVoices.delete(guildId);
	}

	public getAllTracksFromGuildFolder(guildId: string): string[] {
		const fp: string = path.join(process.env.SONG_FOLDER!, guildId);
		if (!fs.existsSync(fp)) {
			throw new ClientError('there are no songs in this server.');
		}
		const songsList: string[] = fs.readdirSync(fp)
			.filter(file => file.endsWith('.mp3'))
			.map(choice => choice.substring(0, choice.length - 4));
		if (songsList.length <= 0) {
			throw new ClientError('there are no songs in this server.');
		}
		return songsList;
	}
}