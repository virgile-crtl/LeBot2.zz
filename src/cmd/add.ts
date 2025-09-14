import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { dbClient } from '..';
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
		throw ClientError.fromError(err, 'Erreur lors du telechargement');
	}
	const stdot = output.toString().match(/\[ExtractAudio\] Destination: (.+\.mp3)/);
	if (!stdot || !stdot[1]) throw new ClientError('Impossible de trouver le nom du morceau');
	return path.basename(stdot[1]).slice(0, -4);
}

export default {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Adds a song to the bot.')
		.addStringOption(option =>
			option
				.setName('url')
				.setDescription('The url of the song you want to add.')
				.setRequired(true),
		)
		.addBooleanOption(option =>
			option
				.setName('toqueue')
				.setDescription('Whether or not you want to add the song to the queue.')
				.setRequired(false),
		)
		.addBooleanOption(option =>
			option
				.setName('shuffle')
				.setDescription('Whether or not you want to play a random song.')
				.setRequired(false),
		),

	async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		const guildFolder = path.join(process.env.SONG_FOLDER! + interaction.guildId);
		if (!fs.existsSync(guildFolder)) { fs.mkdirSync(guildFolder); }

  	interaction.reply('Lancement du téléchargement');
		const trackName = await downloadTrackFromYoutube(interaction.options.getString('url')!, guildFolder);
		interaction.editReply('✅ Téléchargement terminé !');

		if (interaction.options.getBoolean('toqueue')) {
			if (!dbClient.guildVoiceExist(interaction.guildId)) {
				createGuildPlayer(path.join(guildFolder, trackName + '.mp3'), interaction);
				return interaction.followUp('I am playing ' + trackName);
			}
			else {
				addToQueue(trackName, interaction);
				return interaction.followUp('I added ' + trackName + ' to the queue.');
			}
		}
	},
};
