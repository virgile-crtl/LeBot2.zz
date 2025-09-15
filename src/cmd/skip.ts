import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient, langClient } from '../index';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';

export default {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the current track.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError(langClient.t('notInServer'));
		}
		const track_name: string | undefined = dbClient.getGuildPlayer(interaction.guildId).skip();
		if (track_name) {
			await interaction.reply(langClient.t('skipTrack', { trackName: track_name }));
		}
		else {
			dbClient.deleteGuildPlayer(interaction.guildId);
			await interaction.reply(langClient.t('stopNoTracks'));
		}
	},
};