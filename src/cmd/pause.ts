import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import VoiceClient from '../voiceClient';
import ClientError from '../clientError';

export default {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause the current song.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		try {
			VoiceClient.pause(interaction.guildId);
			await interaction.reply('I paused the current song.');
		} catch (err) {
			console.error(err);
			if (err instanceof ClientError) interaction.reply(err.message);
			else interaction.reply('Unknow Error')
		}
	},
};