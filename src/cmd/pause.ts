import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient, langClient } from '..';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';

export default {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause the current track.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError(langClient.t('notPlayMusic'));
		}
		dbClient.getGuildPlayer(interaction.guildId).pause();
		await interaction.reply(langClient.t('pausedTrack'));
	},
};