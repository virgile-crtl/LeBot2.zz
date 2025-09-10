import { AudioPlayer } from '@discordjs/voice';

export default interface GuildVoice {
  player: AudioPlayer;
  shuffle: boolean;
  stack: string[];
  // eslint-disable-next-line semi
}