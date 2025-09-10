import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import VoiceClient from '../voiceClient';
import ClientError from '../clientError';

export default {
	data: new SlashCommandBuilder()
		.setName('quit')
		.setDescription('Quits the voice channel you are in.'),

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		try {
			VoiceClient.stop(interaction.guildId);
			await interaction.reply('I leave it');
		} catch (err) {
			if (err instanceof ClientError) {
				console.info(err.message)
				interaction.reply(err.message);
			} else
				throw err
		}
	},
};