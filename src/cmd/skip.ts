import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient } from '../index';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';

export default {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the current track.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError('I am not in this server.');
		}
		const track_name: string | undefined = dbClient.getGuildPlayer(interaction.guildId).skip();
		if (track_name) {
			await interaction.reply('I skipped the current song and I am playing ' + track_name);
		}
		else {
			dbClient.deleteGuildPlayer(interaction.guildId);
			await interaction.reply('I stopped playing because there are no more songs in the queue.');
		}
	},
};