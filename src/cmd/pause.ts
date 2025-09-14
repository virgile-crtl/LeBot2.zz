import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient } from '..';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';

export default {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause the current song.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError('I am not playing musique in this server.');
		}
		dbClient.getGuildVoice(interaction.guildId).pause();
		await interaction.reply('I paused the current song.');
	},
};