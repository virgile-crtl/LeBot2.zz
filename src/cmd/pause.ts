import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';
import GuildPlayer from '../guildPlayer';
import { t } from '../i18next';
import PlayerService from '../playerService';

export default {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause the current track.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError(t('notPlayMusic'));
		}
		const player: GuildPlayer = PlayerService.getInstance().getGuildPlayer(interaction.guildId);
		player.pause();
		player.updateChannelId(interaction.channelId, interaction.channel);
		await interaction.reply(t('pausedTrack'));
	},
};