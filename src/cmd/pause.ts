import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pauses the current song.'),

	async execute(interaction: ChatInputCommandInteraction) {
		const connection = getVoiceConnection(interaction.guildId);
		if (!connection) {
			return interaction.reply('I am not playing musique in this server.');
		}
		connection.state.subscription.player.pause();
		await interaction.reply('I paused the current song.');
	},
};