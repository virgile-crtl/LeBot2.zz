import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import ClientError from '../clientError';
import VoiceClient from '../voiceClient';

export default {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause the current song.'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		try {
			VoiceClient.pause(interaction.guildId);
			await interaction.reply('I paused the current song.');
		} catch (err) {
			if (err instanceof ClientError) {
				console.info(interaction.user.tag + ' encounter this error ' + err.message +' with ' + interaction.commandName + ' command in ' + interaction.guild!.name);
				interaction.reply(err.message);
			} else
				throw err;
		}
	},
};