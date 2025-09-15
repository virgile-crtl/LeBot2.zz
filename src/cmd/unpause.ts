import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient, langClient } from '../index';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';
import GuildPlayer from '../guildPlayer';

export default {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Unpause the current track.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError(langClient.t('notPlay'));
		}
		const player: GuildPlayer = dbClient.getGuildPlayer(interaction.guildId);
		player.unpause();
		player.updateChannelId(interaction.channelId, interaction.channel);
		await interaction.reply(langClient.t('resumedTrack'));
	},
};