import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient } from '../index';

export default {
	data: new SlashCommandBuilder()
		.setName('quit')
		.setDescription('Quit the voice channel where I am'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		dbClient.getGuildPlayer(interaction.guildId).stop();
		dbClient.deleteGuildPlayer(interaction.guildId);
		await interaction.reply('I leave it.');
	},
};