import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Unpauses the current song.'),
	async execute(interaction: ChatInputCommandInteraction) {
		const connection = getVoiceConnection(interaction.guildId);
		if (!connection) {
			return interaction.reply('I am not playing musique in this server.');
		}
		connection.state.subscription.player.unpause();
		await interaction.reply('I unpaused the current song.');
	},
};