import { AudioPlayer } from "@discordjs/voice";
import ClientError from "./clientError";
import fs from 'fs'
import GuildVoice from "./types/guildVoice";
import path from 'path';

export default class DbClient {
  private guildsInfos: Map<string, GuildVoice>

  constructor() {
    this.guildsInfos = new Map();
  }

  createGuildVoice(guildId: string, shuf:boolean, play: AudioPlayer): void {
    this.guildsInfos.set(guildId, { shuffle: shuf, stack: [], player: play });
  }

  addSongToQueue(guildId: string, song: string): void {
    const guildVoice: GuildVoice = this.getGuildVoice(guildId);
    guildVoice.stack.push(song);
  }

  updateShuffle(guildId: string, shuf: boolean) {
    const guildVoice: GuildVoice = this.getGuildVoice(guildId);
    guildVoice.shuffle = shuf
  }

  getShuffle(guildId: string) {
    const guildVoice: GuildVoice = this.getGuildVoice(guildId);
    return guildVoice.shuffle
  }

  getGuildVoice(guildId: string): GuildVoice {
    const guildVoice = this.guildsInfos.get(guildId);
    if (!guildVoice) throw new ClientError('I didn\'t find your Musique session' )
    return guildVoice
  }

  getNextSong(guildId: string): string {
    const guildVoice: GuildVoice = this.getGuildVoice(guildId);
    if (guildVoice.stack.length > 0) {
      return guildVoice.stack.shift()!;
    } else {
      try {
        const songsList = fs.readdirSync(path.join(process.env.SONG_FOLDER + guildId))
          .filter(file => file.endsWith('.mp3'))
          .map(choice => choice.substring(0, choice.length - 4));
        const random = Math.floor(Math.random() * songsList.length);
        return songsList[random];
      } catch(err) {
        throw new ClientError('Erreur during search next song')
      }
    }
  }

  getAllsongs(guildId: string): string[] {
    const fp: string = path.join(process.env.SONG_FOLDER!, guildId);
		if (!fs.existsSync(fp) || fs.readdirSync(fp).length === 0)
			throw new ClientError('there are no songs in this server.')
		const songsList: string[] = fs.readdirSync(fp)
			.filter(file => file.endsWith('.mp3'))
			.map(choice => choice.substring(0, choice.length - 4))
    return songsList
  }

  deleteGuildVoice(guildId: string): void {
    this.guildsInfos.delete(guildId);
  }
}