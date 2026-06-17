import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbclient } from '../dbclient';
import type { Music } from '@prisma/client';
import ClientError from '../clientError';
import getAllTracksFromGuildFolder from '../utils/getAllTracksFromGuildFolder';
import i18next from 'i18next';
import putTrackInPlayer from '../utils/putTrackInPlayer';

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
		const filter_tracks_list: string[] = (await getAllTracksFromGuildFolder(interaction.guildId)).filter(
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
		const track_name: string = interaction.options.getString('track')!;
		const track: Music | null = await dbclient.music.findUnique({ where: { title: track_name } });

		if (!track) {
			throw new ClientError(i18next.t('errors.music.trackNotFound', { trackName: track_name }));
		}
		await putTrackInPlayer(interaction, track, interaction.reply.bind(interaction));
	},
};