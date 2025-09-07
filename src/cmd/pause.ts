import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { dbClient } from '../index';
import GuildVoice from '../types/guildVoice';

export default {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pauses the current song.'),

	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.guildId)
			return interaction.reply('This command can only be used in a server.');
		const guildVoice: GuildVoice | undefined = dbClient.getGuildVoice(interaction.guildId)
		if (!getVoiceConnection(interaction.guildId) || !guildVoice)
			return interaction.reply('I am not playing musique in this server.');
		guildVoice.player.pause();
		await interaction.reply('I paused the current song.');
	},
};