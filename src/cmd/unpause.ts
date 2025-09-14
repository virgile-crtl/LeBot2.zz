import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ClientError from '../clientError';
import { dbClient } from '../index';
import { getVoiceConnection } from '@discordjs/voice';

export default {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Unpause the current song.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError('I am not playing musique in this server.');
		}
		dbClient.getGuildVoice(interaction.guildId).unpause();
		await interaction.reply('I unpaused the current song.');
	},
};