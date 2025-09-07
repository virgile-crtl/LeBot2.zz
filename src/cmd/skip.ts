import "dotenv/config"
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection, createAudioResource } from '@discordjs/voice';
import path from 'path';
import { dbClient } from '../index';
import GuildVoice from '../types/guildVoice';

export default {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('skips the current song.'),

	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.guildId)
			return interaction.reply('This command can only be used in a server.');
		const connection = getVoiceConnection(interaction.guildId);
		const guildVoice: GuildVoice | undefined = dbClient.getGuildVoice(interaction.guildId)
		if (!connection || !guildVoice)
			return interaction.reply('I am not playing anything.');
		if (guildVoice.shuffle) {
			guildVoice.player.play(createAudioResource(path.join(
			process.env.SONG_FOLDER!, interaction.guildId, dbClient.getNextSong(interaction.guildId) + '.mp3')));
			await interaction.reply('I skipped the current song.');
		} else {
			dbClient.deleteGuildVoice(interaction.guildId)
			if (connection) connection.destroy();
			return interaction.reply('I stopped playing because there are no more songs in the queue.');
		}
	}
};