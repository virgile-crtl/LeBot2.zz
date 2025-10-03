import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { t } from '../i18next';
import ClientError from '../clientError';
import GuildPlayer from '../guildPlayer';
import PlayerService from '../playerService';

export default {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Unpause the current track.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError(t('notPlay'));
		}
		if (!interaction.channel || !interaction.channel.isTextBased()) {
			throw new ClientError(t('commandInTextChannel'));
		}

		const player: GuildPlayer = PlayerService.getInstance().getGuildPlayer(interaction.guildId);
		player.unpause();
		player.updateChannelId(interaction.channelId);
		await interaction.reply(t('resumedTrack'));
	},
};