import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { dbClient } from '../index';

export default {
	data: new SlashCommandBuilder()
		.setName('quit')
		.setDescription('Quits the voice channel you are in.'),

	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.guildId)
			return interaction.reply('This command can only be used in a server.');
		const connection = getVoiceConnection(interaction.guildId);
		if (!connection)
			return interaction.reply('I am not in this server.');
		dbClient.deleteGuildVoice(interaction.guildId)
		connection.destroy();
		await interaction.reply('I quit the voice channel.');
	},
};