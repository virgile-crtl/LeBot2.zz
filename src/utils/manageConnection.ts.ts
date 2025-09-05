import { createAudioResource, getVoiceConnection, createAudioPlayer, AudioPlayerStatus } from '@discordjs/voice';
import path from 'path';

export default function manageConnection(interaction, Path, res) {
	if (!getVoiceConnection(interaction.guildId)) {
		const connection = openConnection(interaction);
		const player = createAudioPlayer();
		const resource = createAudioResource(path.join(Path, res + '.mp3'));
		player.play(resource);
		connection.subscribe(player);
		player.on(AudioPlayerStatus.Idle, () => playerIdle(interaction, connection, player, Path));
		return interaction.reply(`I am playing "${res}"`);
	}
	else {
		Stack.find(x => x.id === interaction.guildId).list.push(res);
		return interaction.reply(`I added "${res}" to the queue.`);
	}
}