import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient } from '../index';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';

export default {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Unpause the current track.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError('I am not playing musique in this server.');
		}
		dbClient.getGuildPlayer(interaction.guildId).unpause();
		await interaction.reply('I unpaused the current song.');
	},
};