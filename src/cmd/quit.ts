import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient } from '../index';

export default {
	data: new SlashCommandBuilder()
		.setName('quit')
		.setDescription('Quits the voice channel you are in.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		dbClient.getGuildVoice(interaction.guildId).stop();
		dbClient.deleteGuildVoice(interaction.guildId);
		await interaction.reply('I leave it.');
	},
};