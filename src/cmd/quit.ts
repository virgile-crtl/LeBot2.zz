import { ChatInputApplicationCommandData, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import removeInfos from '../utils/removeInfos';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quit')
		.setDescription('Quits the voice channel you are in.'),

	async execute(interaction: ChatInputCommandInteraction) {
		const connection = getVoiceConnection(interaction.guildId);
		if (!connection) {
			return interaction.reply('I am not in this server.');
		}
		removeInfos(interaction.guildId);
		connection.destroy();
		await interaction.reply('I quit the voice channel.');
	},
};