import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { t } from '../i18next';
import ClientError from '../clientError';
import GuildPlayer from '../guildPlayer';
import PlayerService from '../playerService';

export default {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the current track.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError(t('notInServer'));
		}
		if (!interaction.channel || !interaction.channel.isTextBased()) {
			throw new ClientError(t('commandInTextChannel'));
		}

		const playerService: PlayerService = PlayerService.getInstance();
		const player: GuildPlayer = playerService.getGuildPlayer(interaction.guildId);
		const track_name: string | undefined = player.skip();
		if (track_name) {
			if (!interaction.channel || !interaction.channel.isTextBased()) {
				throw new ClientError(t('commandInTextChannel'));
			}
			player.updateChannelId(interaction.channelId);
			await interaction.reply(t('skipTrack', { trackName: track_name }));
		}
		else {
			playerService.deleteGuildPlayer(interaction.guildId);
			await interaction.reply(t('stopNoTracks'));
		}
	},
};