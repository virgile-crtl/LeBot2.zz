import { AutocompleteInteraction, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { t } from '../i18n';
import ClientError from '../clientError';
import DsClient from '../dsClient';
import fs from 'fs';
import getAllTracksFromGuildFolder from '../utils/getAllTracksFromGuildFolder';
import path from 'path';
import PlayerService from '../playerService';
import GuildPlayer from '../guildPlayer';

export default {
	data: new SlashCommandBuilder()
		.setName('music.play')
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
		const filter_tracks_list: string[] = getAllTracksFromGuildFolder(interaction.guildId).filter(
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
			throw new ClientError(t('errors.music.noTracksInServer'));
		};
		if (!fs.existsSync(path.join(guild_folder, track_name + '.mp3'))) {
			throw new ClientError(t('errors.music.trackNotFound', { trackName: track_name }));
		}
		if (!interaction.member || !(interaction.member instanceof GuildMember)
					|| !interaction.member.voice.channelId) {
			throw new ClientError(t('errors.music.needVoiceChannel'));
		}
		if (!interaction.channel || !interaction.channel.isTextBased()) {
			throw new ClientError(t('errors.cmd.commandInTextChannel'));
		}

		if (!getVoiceConnection(interaction.guildId)) {
			const guildPlayer = new GuildPlayer(interaction.guildId, interaction.options.getBoolean('rand') ?? true,
				interaction.channelId, (interaction.client as DsClient), {
					channelId: interaction.member.voice.channelId,
		    	guildId: interaction.guildId,
		    	adapterCreator: interaction.guild.voiceAdapterCreator,
				},
			);
			guildPlayer.play(path.join(guild_folder, track_name + '.mp3'));
			PlayerService.getInstance().saveGuildPlayer(interaction.guildId, guildPlayer);
			await interaction.reply(t('music.play', { trackName: track_name }));
		}
		else {
			PlayerService.getInstance().updatePlayer(track_name, interaction.guildId,
				interaction.channelId, interaction.options.getBoolean('rand'));
			await interaction.reply(t('music.trackAdd', { trackName: track_name }));
		}
	},
};