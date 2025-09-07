import { DbError } from "./errors";
import GuildVoice from "./types/guildVoice";
import { AudioPlayer } from "@discordjs/voice";
import { DbErrorType } from "./enum";

export default class DbClient {
  private guildsInfos: Map<string, GuildVoice>

  constructor() {
    this.guildsInfos = new Map();
  }

  createGuildVoice(guildId: string, shuf:boolean, play: AudioPlayer): void {
    this.guildsInfos.set('guildId', { shuffle: false, stack: [], player: play });
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

  deleteGuildVoice(guildId: string): void {
    this.guildsInfos.delete(guildId);
  }
}