import { createAudioResource } from '@discordjs/voice';
import path from 'path';


export default function playerIdle(interaction, connection, player, Path) {
	if (Stack.find(x => x.id === interaction.guildId).list.length === 0 && !Stack.find(x => x.id === interaction.guildId).rand) {
		removeInfos(Stack, interaction);
		connection.destroy();
		return;
	}
	else {
		const song = getRessources(Path, interaction.guildId);
		const resource = createAudioResource(path.join(Path, song + '.mp3'));
		player.play(resource);
	}
}