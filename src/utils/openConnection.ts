import { joinVoiceChannel } from '@discordjs/voice';

export default function openConnection(interaction) {
	removeInfos(interaction.guildId);
	Stack.push({ rand: interaction.options.getBoolean('random'), list: [], id: interaction.guildId });
	return joinVoiceChannel({
		channelId: interaction.member.voice.channelId,
		guildId: interaction.guildId,
		adapterCreator: interaction.guild.voiceAdapterCreator,
	});
}