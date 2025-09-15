import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { langClient } from '..';
import addToQueue from '../utils/addToQueue';
import ClientError from '../clientError';
import createGuildPlayer from '../utils/createGuildPlayer';
import fs from 'fs';
import path from 'path';
import ytdl from 'youtube-dl-exec';

async function downloadTrackFromYoutube(url: string, outputDir: string): Promise<string> {
	let output = undefined;
	try {
		output = await ytdl(url, {
			noPlaylist: true,
			extractAudio: true,
			audioFormat: 'mp3',
			output: path.join(outputDir, '%(title)s - %(artist)s.%(ext)s'),
		});
	}
	catch (err) {
		throw ClientError.fromError(err, langClient.t('downloadError'));
	}
	const stdot = output.toString().match(/\[ExtractAudio\] Destination: (.+\.mp3)/);
	if (!stdot || !stdot[1]) throw new ClientError('Impossible de trouver le nom du morceau');
	return path.basename(stdot[1]).slice(0, -4);
}

export default {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Adds a track to the bot.')
		.addStringOption(option =>
			option
				.setName('url')
				.setDescription('The url of the track you want to add.')
				.setRequired(true),
		)
		.addBooleanOption(option =>
			option
				.setName('rand')
				.setDescription('Whether or not you want to play a random track after your queue.')
				.setRequired(false),
		)
		.addBooleanOption(option =>
			option
				.setName('to_queue')
				.setDescription('Whether or not you want to add the track to the queue.')
				.setRequired(false),
		),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		const guild_folder: string = path.join(process.env.PLAYLISTS_FOLDER! + interaction.guildId);
		if (!fs.existsSync(guild_folder)) { fs.mkdirSync(guild_folder); }

  	interaction.reply(langClient.t('startDownload'));
		const track_name: string = await downloadTrackFromYoutube(interaction.options.getString('url')!, guild_folder);
		interaction.editReply(langClient.t('downloadCompleted'));

		const to_queue = interaction.options.getBoolean('to_queue') ?? true;
		if (to_queue) {
			if (!getVoiceConnection(interaction.guildId)) {
				createGuildPlayer(path.join(guild_folder, track_name + '.mp3'), interaction);
				await interaction.followUp(langClient.t('play', { trackName: track_name }));
			}
			else {
				addToQueue(track_name, interaction);
				await interaction.followUp(langClient.t('trackAdd', { trackName: track_name }));
			}
		}
	},
};
