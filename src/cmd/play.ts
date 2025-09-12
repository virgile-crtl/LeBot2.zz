import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { putSongPlay } from '../utils/tmp';
import ClientError from '../clientError';
import fs from 'fs';
import getAllTracks from '../utils/getAllTracks';
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
		try {
			const focusedValue: string = interaction.options.getFocused();
			const songsList: string[] = getAllTracks(interaction.guildId).filter(
				(song: string) => song.toLowerCase().includes(focusedValue.toLowerCase()));
			if (songsList.length > 25) {
				await interaction.respond(songsList.slice(0, 25)
					.map(choice => ({ name: choice, value: choice })));
			}
			else {
				await interaction.respond(songsList.map(choice => ({ name: choice, value: choice })));
			}
		}
		catch (err) {
			if (err instanceof ClientError) {
				console.info(interaction.user.tag + ' encounter this error ' + err.message + ' with ' + interaction.commandName + ' command in ' + interaction.guild!.name);
				interaction.respond([{ name: err.message, value: err.message }]);
			}
			else {
				interaction.respond([{ name: 'error while listing files', value: 'error while listing files' }]);
				console.error(err);
			}
		}
	},

	async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		try {
			const folder = path.join(process.env.SONG_FOLDER!, interaction.guildId);
			const song = interaction.options.getString('song')!;

			if (!fs.existsSync(folder)) {
				throw new ClientError('there are no songs in this server.');
			};
			if (!fs.existsSync(path.join(folder, song + '.mp3'))) {
				throw new ClientError(song + ' does not exist.');
			}
			putSongPlay(interaction, song, folder, interaction.reply.bind(interaction));
		}
		catch (err) {
			if (err instanceof ClientError) {
				console.info(interaction.user.tag + ' encounter this error \'' + err.message + '\' with ' + interaction.commandName + ' command in ' + interaction.guild!.name);
				interaction.reply(err.message);
			}
			else { throw err; }
		}
	},
};
