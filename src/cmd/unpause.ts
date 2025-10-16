import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';
import GuildPlayer from '../guildPlayer';
import i18next from 'i18next';
import PlayerService from '../playerService';

export default {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Unpause the current track.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError(i18next.t('errors.music.notPlay'));
		}
		if (!interaction.channel || !interaction.channel.isTextBased()) {
			throw new ClientError(i18next.t('errors.cmd.commandInTextChannel'));
		}

		const player: GuildPlayer = PlayerService.getInstance().getGuildPlayer(interaction.guildId);
		player.unpause();
		player.updateChannelId(interaction.channelId);
		await interaction.reply(i18next.t('music.resumedTrack'));
	},
};