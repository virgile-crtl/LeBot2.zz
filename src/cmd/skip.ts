import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';
import GuildPlayer from '../guildPlayer';
import i18next from 'i18next';
import PlayerService from '../playerService';

export default {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the current track.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError(i18next.t('errors.music.notInServer'));
		}
		if (!interaction.channel || !interaction.channel.isTextBased()) {
			throw new ClientError(i18next.t('errors.cmd.commandInTextChannel'));
		}

		const playerService: PlayerService = PlayerService.getInstance();
		const player: GuildPlayer = playerService.getGuildPlayer(interaction.guildId);
		const track_name: string | undefined = player.skip();
		if (track_name) {
			if (!interaction.channel || !interaction.channel.isTextBased()) {
				throw new ClientError(i18next.t('errors.cmd.commandInTextChannel'));
			}
			player.updateChannelId(interaction.channelId);
			await interaction.reply(i18next.t('music.skipTrack', { trackName: track_name }));
		}
		else {
			playerService.deleteGuildPlayer(interaction.guildId);
			await interaction.reply(i18next.t('music.stopNoTracks'));
		}
	},
};