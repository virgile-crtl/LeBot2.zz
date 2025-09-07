import { ChatInputCommandInteraction, Guild, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection, VoiceConnection } from '@discordjs/voice';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pauses the current song.'),

	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.guildId)
			return interaction.reply('This command can only be used in a server.');
		const guildSongInfos: GuildsSongInfos = GuildsSongInfos.getInstance();
		if (!connection) {
			return interaction.reply('I am not playing musique in this server.');
		}
		connection.state.subscription.player.pause();
		await interaction.reply('I paused the current song.');
	},
};