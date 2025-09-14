import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient } from '../index';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';

export default {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('skips the current song.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		if (!getVoiceConnection(interaction.guildId)) {
			throw new ClientError('I am not in this server.');
		}
		const trackName = dbClient.getGuildVoice(interaction.guildId).skip();
		if (trackName) {
			return interaction.reply('I skipped the current song and I am playing ' + trackName);
		}
		else {
			return interaction.reply('I stopped playing because there are no more songs in the queue.');
		}
	},
};