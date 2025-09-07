import GuildVoice from "./types/guildVoice";
import { AudioPlayer, VoiceConnection } from "@discordjs/voice";

export default class DbClient {
    private guildsInfos: Map<string, GuildVoice>
  constructor() {
    this.guildsInfos = new Map();
  }

  createGuildVoice(guildId: string, shuf:boolean, play: AudioPlayer): void {
    if (this.guildsInfos.has(guildId))
    this.guildsInfos.set('guildId', { shuffle: false, stack: [], player: play });
  }

  addSongToQueue(guildId: string, song: string): void {
    const guildVoice = this.guildsInfos.get(guildId);
    if (guildVoice) {
      guildVoice.stack.push(song);
      this.guildsInfos.set(guildId, guildVoice);
    }
  }
}