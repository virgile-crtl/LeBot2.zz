import { SlashCommandBuilder } from 'discord.js';
import manageConnection from '../utils/manageConnection.ts';
import path from 'path';
import fs from 'fs';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song in the voice channel you are in.')
		.addStringOption(option =>
			option
				.setName('song')
				.setDescription('The song you want to play.')
				.setRequired(true)
				.setAutocomplete(true),
		)
		.addBooleanOption(option =>
			option
				.setName('random')
				.setDescription('Whether or not you want to play a random song.')
				.setRequired(false),
		),

	async autocomplete(interaction) {
		const Path = path.join(__dirname, '../../song/', interaction.guildId);
		if (!fs.existsSync(Path)) {
			return interaction.respond([{ name: 'there are no songs in this server.', value: 'there are no songs in this server.' }]);
		}
		const focusedValue = interaction.options.getFocused();
		const choices = fs.readdirSync(Path).filter(file => file.endsWith('.mp3'));
		const noend = choices.map(choice => choice.substring(0, choice.length - 4));
		const filtered = noend.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()));
		if (filtered.length > 25) {
			return;
		}
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},

	async execute(interaction) {
		if (!interaction.member.voice.channelId) {
			return interaction.reply('you need to be in a voice channel to use this command.');
		}
		const Path = path.join(__dirname, '../../song/', interaction.guildId);
		if (!fs.existsSync(Path)) {
			return interaction.reply('there are no songs in this server.');
		}
		if (!fs.existsSync(path.join(Path, interaction.options.getString('song') + '.mp3'))) {
			return interaction.reply('that song does not exist.');
		}
		return manageConnection(interaction, Path, interaction.options.getString('song'));
	},
};