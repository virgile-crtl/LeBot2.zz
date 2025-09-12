import { AudioPlayer } from '@discordjs/voice';
import ClientError from './clientError';
import GuildVoice from './types/guildVoice';
import getAllTracks from './utils/getAllTracks';
import path from 'path';

export default class DbClient {
	private guildsInfos: Map<string, GuildVoice>;

	constructor() {
		this.guildsInfos = new Map();
	}

	public createGuildVoice(guildId: string, shuf:boolean, play: AudioPlayer, chanId: string): void {
		this.guildsInfos.set(guildId, { shuffle: shuf, stack: [], player: play, randomStack: this.createRandomStack(guildId), channelId: chanId });
	}

	public getGuildVoice(guildId: string): GuildVoice {
		const guildVoice = this.guildsInfos.get(guildId);
		if (!guildVoice) throw new ClientError('I didn\'t find your Musique session');
		return guildVoice;
	}

	public deleteGuildVoice(guildId: string) {
		this.guildsInfos.delete(guildId);
	}

	public updateShuffle(guildId: string, shuf: boolean) {
		this.getGuildVoice(guildId).shuffle = shuf;
	}

	public getShuffle(guildId: string) {
		return this.getGuildVoice(guildId).shuffle;
	}

	public updateChannelId(guildId: string, chan: string) {
		this.getGuildVoice(guildId).channelId = chan;
	}

	public getChannelId(guildId: string) {
		return this.getGuildVoice(guildId).channelId;
	}

	public getPlayer(guildId: string): AudioPlayer {
		return this.getGuildVoice(guildId).player;
	}

	public addSongToQueue(guildId: string, song: string) {
		const guildVoice: GuildVoice = this.getGuildVoice(guildId);
		const i: number = guildVoice.randomStack.indexOf(song);

		if (i != -1) { guildVoice.randomStack.splice(i, 1); }
		guildVoice.stack.push(song);
	}

	public getNextSong(guildId: string): string {
		const guildVoice: GuildVoice = this.getGuildVoice(guildId);
		if (guildVoice.stack.length > 0) {
			return path.join(process.env.SONG_FOLDER!, guildId, guildVoice.stack.shift()! + '.mp3');
		}
		else if (guildVoice.randomStack.length > 0) {
			return path.join(process.env.SONG_FOLDER!, guildId, guildVoice.randomStack.shift()! + '.mp3');
		}
		else {
			guildVoice.randomStack = this.createRandomStack(guildId);
			return path.join(process.env.SONG_FOLDER!, guildId, guildVoice.randomStack.shift()! + '.mp3');
		}
	}

	private createRandomStack(guildId: string): string[] {
		const songsList = getAllTracks(guildId);

		for (let i = songsList.length - 1; i > 0; i -= 1) {
			const j = Math.floor(Math.random() * (i + 1));
    	[songsList[i], songsList[j]] = [songsList[j], songsList[i]];
  	}
		return songsList;
	}
}