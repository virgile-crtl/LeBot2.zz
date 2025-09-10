import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient } from '../index';
import VoiceClient from '../voiceClient';
import ClientError from '../clientError';

export default {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('skips the current song.'),

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		try {
			if (dbClient.getShuffle(interaction.guildId)) {
				const songName = VoiceClient.skip(interaction.guildId, interaction.followUp.bind(interaction));
				await interaction.reply('I skipped the current song and I am playing ' + songName);
			} else {
				VoiceClient.stop(interaction.guildId)
				return interaction.reply('I stopped playing because there are no more songs in the queue.');
			}
		} catch (err) {
			if (err instanceof ClientError) {
				console.info(err.message)
				interaction.reply(err.message);
			} else
				throw err
		}
	}
};