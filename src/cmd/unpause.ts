import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';
import GuildPlayer from '../guildPlayer';
import { t } from '../i18next';
import PlayerService from '../playerService';

export default {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Unpause the current track.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError(t('notPlay'));
		}
		const player: GuildPlayer = PlayerService.getInstance().getGuildPlayer(interaction.guildId);
		player.unpause();
		player.updateChannelId(interaction.channelId, interaction.channel);
		await interaction.reply(t('resumedTrack'));
	},
};