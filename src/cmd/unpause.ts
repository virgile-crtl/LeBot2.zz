import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ClientError from '../clientError';
import VoiceClient from '../voiceClient';

export default {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Unpause the current song.'),

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		try {
			VoiceClient.unpause(interaction.guildId);
			await interaction.reply('I unpaused the current song.');
		} catch (err) {
			if (err instanceof ClientError) {
				console.info(err.message)
				interaction.reply(err.message);
			} else
				throw err
		}
	},
};