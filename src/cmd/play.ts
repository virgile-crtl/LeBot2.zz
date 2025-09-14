import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient } from '../index';
import addToQueue from '../utils/addToQueue';
import ClientError from '../clientError';
import createGuildPlayer from '../utils/createGuildPlayer';
import fs from 'fs';
import path from 'path';

export default {
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
				.setName('shuffle')
				.setDescription('Whether or not you want to play a random song.')
				.setRequired(false),
		),

	async autocomplete(interaction: AutocompleteInteraction<'cached'>) {
		const focusedValue: string = interaction.options.getFocused();
		const songsList: string[] = dbClient.getAllTracksFromGuildFolder(interaction.guildId).filter(
			(song: string) => song.toLowerCase().includes(focusedValue.toLowerCase()));
		if (songsList.length > 25) {
			await interaction.respond(songsList.slice(0, 25)
				.map(choice => ({ name: choice, value: choice })));
		}
		else {
			await interaction.respond(songsList.map(choice => ({ name: choice, value: choice })));
		}
	},

	async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		const guildFolder = path.join(process.env.SONG_FOLDER!, interaction.guildId);
		const trackName = interaction.options.getString('song')!;
		if (!fs.existsSync(guildFolder)) {
			throw new ClientError('there are no songs in this server.');
		};
		if (!fs.existsSync(path.join(guildFolder, trackName + '.mp3'))) {
			throw new ClientError(trackName + ' does not exist in this server.');
		}
		if (!interaction.channel || !interaction.channel.isTextBased()) {
			throw new ClientError('you need to make the command in a Text channel to play song.');
		}

		if (!dbClient.guildVoiceExist(interaction.guildId)) {
			createGuildPlayer(path.join(guildFolder, trackName + '.mp3'), interaction);
			return interaction.reply('I am playing ' + trackName);
		}
		else {
			addToQueue(trackName, interaction);
			return interaction.reply('I added ' + trackName + ' to the queue.');
		}
	},
};