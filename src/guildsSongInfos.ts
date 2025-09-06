import GuildSongInfos from './types/guildSongInfos';

export default class GuildsSongInfos {
  private static instance: GuildsSongInfos;
  private guildsInfos: Map<string, GuildSongInfos> = new Map();

  private constructor() {}

  public static getInstance(): GuildsSongInfos {
    if (!GuildsSongInfos.instance) {
      GuildsSongInfos.instance = new GuildsSongInfos();
    }
    return GuildsSongInfos.instance;
  }

  createGuildInfos(guildId: string, shuf: boolean): void {
    this.guildsInfos.set(guildId, { shuffle: shuf, stack: [] });
  }

  addSongToQueue(guildId: string, songName: string): void {
    this.guildsInfos.get(guildId)!.stack.push(songName);
  }

  updateShuffle(guildId: string, shuf: boolean): void {
    this.guildsInfos.get(guildId)!.shuffle = shuf;
  }

  getNextSong(guildId: string): string | undefined {
    return this.guildsInfos.get(guildId)!.stack.shift();
  }

  removeGuildStack(guildId: string): void {
    this.guildsInfos.delete(guildId);
  }
}

