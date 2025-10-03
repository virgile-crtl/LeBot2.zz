import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';
import GuildPlayer from '../guildPlayer';
import { t } from '../i18next';
import PlayerService from '../playerService';

export default {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the current track.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError(t('notInServer'));
		}
		const playerService: PlayerService = PlayerService.getInstance();
		const player: GuildPlayer = playerService.getGuildPlayer(interaction.guildId);
		const track_name: string | undefined = player.skip();
		if (track_name) {
			player.updateChannelId(interaction.channelId, interaction.channel);
			await interaction.reply(t('skipTrack', { trackName: track_name }));
		}
		else {
			playerService.deleteGuildPlayer(interaction.guildId);
			await interaction.reply(t('stopNoTracks'));
		}
	},
};