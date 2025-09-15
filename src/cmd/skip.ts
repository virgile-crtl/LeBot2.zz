import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient, langClient } from '../index';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';
import GuildPlayer from '../guildPlayer';

export default {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the current track.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError(langClient.t('notInServer'));
		}
		const player: GuildPlayer = dbClient.getGuildPlayer(interaction.guildId);
		const track_name: string | undefined = player.skip();
		if (track_name) {
			player.updateChannelId(interaction.channelId, interaction.channel);
			await interaction.reply(langClient.t('skipTrack', { trackName: track_name }));
		}
		else {
			dbClient.deleteGuildPlayer(interaction.guildId);
			await interaction.reply(langClient.t('stopNoTracks'));
		}
	},
};