import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient, langClient } from '../index';
import { getVoiceConnection } from '@discordjs/voice';
import addToQueue from '../utils/addToQueue';
import ClientError from '../clientError';
import createGuildPlayer from '../utils/createGuildPlayer';
import fs from 'fs';
import path from 'path';

export default {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a track in the voice channel you are in.')
		.addStringOption(option =>
			option
				.setName('track')
				.setDescription('The track you want to play.')
				.setRequired(true)
				.setAutocomplete(true),
		)
		.addBooleanOption(option =>
			option
				.setName('rand')
				.setDescription('Whether or not you want to play a random track.')
				.setRequired(false),
		),

	async autocomplete(interaction: AutocompleteInteraction<'cached'>): Promise<void> {
		const search_value: string = interaction.options.getFocused();
		const filter_tracks_list: string[] = dbClient.getAllTracksFromGuildFolder(interaction.guildId).filter(
			(track: string) => track.toLowerCase().includes(search_value.toLowerCase()));

		if (filter_tracks_list.length > 25) {
			await interaction.respond(filter_tracks_list.slice(0, 25)
				.map(track => ({ name: track, value: track })));
		}
		else {
			await interaction.respond(filter_tracks_list.map(track => ({ name: track, value: track })));
		}
	},

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		const guild_folder: string = path.join(process.env.PLAYLISTS_FOLDER!, interaction.guildId);
		const track_name: string = interaction.options.getString('track')!;
		if (!fs.existsSync(guild_folder)) {
			throw new ClientError(langClient.t('noTracksInServer'));
		};
		if (!fs.existsSync(path.join(guild_folder, track_name + '.mp3'))) {
			throw new ClientError(langClient.t('trackNotFound', { trackName: track_name }));
		}
		if (!interaction.channel || !interaction.channel.isTextBased()) {
			throw new ClientError(langClient.t('commandInTextChannel'));
		}

		if (!getVoiceConnection(interaction.guildId)) {
			createGuildPlayer(path.join(guild_folder, track_name + '.mp3'), interaction);
			await interaction.reply(langClient.t('play', { trackName: track_name }));
		}
		else {
			addToQueue(track_name, interaction);
			await interaction.reply(langClient.t('trackAdd', { trackName: track_name }));
		}
	},
};