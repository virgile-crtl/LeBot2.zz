import { AudioPlayer } from '@discordjs/voice';

export default interface GuildSongInfos {
  player: AudioPlayer;
  shuffle: boolean;
  stack: string[];
}