import { VoiceConnection, AudioPlayer } from "@discordjs/voice";

export default interface GuildVoice {
  player: AudioPlayer;
  shuffle: boolean;
  stack: string[];
}