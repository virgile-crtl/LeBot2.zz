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
			console.error(err);
			if (err instanceof ClientError) interaction.reply(err.message);
			else interaction.reply('Unknow Error')
		}
	},
};