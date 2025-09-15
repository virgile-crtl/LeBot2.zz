import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient, langClient } from '../index';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';

export default {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Unpause the current track.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError(langClient.t('notPlay'));
		}
		dbClient.getGuildPlayer(interaction.guildId).unpause();
		await interaction.reply(langClient.t('resumedTrack'));
	},
};