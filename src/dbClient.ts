import { AudioPlayer } from '@discordjs/voice';
import ClientError from './clientError';
import fs from 'fs';
import GuildVoice from './types/guildVoice';
import path from 'path';

export default class DbClient {
	private guildsInfos: Map<string, GuildVoice>;

	constructor() {
		this.guildsInfos = new Map();
	}

	public createGuildVoice(guildId: string, shuf:boolean, play: AudioPlayer, chanId: string): void {
		this.guildsInfos.set(guildId, { shuffle: shuf, stack: [], player: play, randomStack: this.createRandomStack(guildId), channelId: chanId });
	}

	public getChannnelId(guildId: string) {
		return this.getGuildVoice(guildId).channelId;
	}

	public addSongToQueue(guildId: string, song: string): void {
		this.getGuildVoice(guildId).stack.push(song);
	}

	public updateShuffle(guildId: string, shuf: boolean) {
		this.getGuildVoice(guildId).shuffle = shuf;
	}

	public getShuffle(guildId: string) {
		return this.getGuildVoice(guildId).shuffle;
	}

	public getGuildVoice(guildId: string): GuildVoice {
		const guildVoice = this.guildsInfos.get(guildId);
		if (!guildVoice) throw new ClientError('I didn\'t find your Musique session');
		return guildVoice;
	}

	public getNextSong(guildId: string): string {
		const guildVoice: GuildVoice = this.getGuildVoice(guildId);
		if (guildVoice.stack.length > 0) {
			return guildVoice.stack.shift()!;
		}
		else if (guildVoice.randomStack.length > 0) {
			return guildVoice.randomStack.shift()!;
		}
		else {
			guildVoice.randomStack = this.createRandomStack(guildId);
			return guildVoice.randomStack.shift()!;
		}
	}

	public getAllsongs(guildId: string): string[] {
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

	public deleteGuildVoice(guildId: string): void {
		this.guildsInfos.delete(guildId);
	}

	private createRandomStack(guildId: string): string[] {
		const songsList = this.getAllsongs(guildId);

		for (let i = songsList.length - 1; i > 0; i -= 1) {
			const j = Math.floor(Math.random() * (i + 1));
    	[songsList[i], songsList[j]] = [songsList[j], songsList[i]];
  	}
		return songsList;
	}
}