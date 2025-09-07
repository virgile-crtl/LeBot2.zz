import "dotenv/config"
import GuildVoice from "./types/guildVoice";
import { AudioPlayer } from "@discordjs/voice";
import fs from 'fs'
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
    const guildVoice: GuildVoice | undefined = this.guildsInfos.get(guildId);
    if (guildVoice)
      guildVoice.stack.push(song);
  }

  updateShuffle(guildId: string, shuf: boolean) {
    const guildVoice: GuildVoice | undefined = this.guildsInfos.get(guildId);
    if (guildVoice)
      guildVoice.shuffle = shuf
  }

  getGuildVoice(guildId: string): GuildVoice | undefined {
    return this.guildsInfos.get(guildId);
  }

  getNextSong(guildId: string): string | undefined {
    const guildVoice: GuildVoice | undefined = this.guildsInfos.get(guildId);
    if (guildVoice) {
      if (guildVoice.stack.length > 0) {
        return guildVoice.stack.shift();
      } else {
        const songsList = fs.readdirSync(path.join(process.env.SONG_FOLDER + guildId))
          .filter(file => file.endsWith('.mp3'))
          .map(choice => choice.substring(0, choice.length - 4));
        const random = Math.floor(Math.random() * songsList.length);
        return songsList[random];
      }
    }
  }

  deleteGuildVoice(guildId: string): void {
    this.guildsInfos.delete(guildId);
  }
}