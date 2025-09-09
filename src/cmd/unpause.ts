import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import VoiceClient from '../voiceClient';
import ClientError from '../clientError';

export default {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Unpause the current song.'),

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		try {
			VoiceClient.unpause(interaction.guildId);
			await interaction.reply('I unpaused the current song.');
		} catch (err) {
			console.error(err);
			if (err instanceof ClientError) interaction.reply(err.message);
			else interaction.reply('Unknow Error')
		}
	},
};