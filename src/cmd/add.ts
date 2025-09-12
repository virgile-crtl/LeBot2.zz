import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { putSongPlay } from '../utils/tmp';
import ClientError from '../clientError';
import fs from 'fs';
import path from 'path';
import ytdl from 'youtube-dl-exec';

async function downloadSong(url: string, outputDir: string): Promise<string> {
	const output = await ytdl(url, {
		noPlaylist: true,
		extractAudio: true,
		audioFormat: 'mp3',
		output: path.join(outputDir, '%(title)s - %(artist)s.%(ext)s'),
	});
	const stdot = output.toString().match(/\[ExtractAudio\] Destination: (.+\.mp3)/);
	if (!stdot || !stdot[1]) throw Error();
	const songName = path.basename(stdot[1]).slice(0, -4);
	return songName;
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
		try {
			const songPath = path.join(process.env.SONG_FOLDER! + interaction.guildId);
			if (!fs.existsSync(songPath)) {
				fs.mkdirSync(songPath);
			}

    	interaction.reply('Lancement du téléchargement');
			const songName = await downloadSong(interaction.options.getString('url')!, songPath);
			interaction.editReply('✅ Téléchargement terminé !');

			if (interaction.options.getBoolean('toqueue')) {
				putSongPlay(interaction, songName, songPath, interaction.followUp.bind(interaction));
			}
		}
		catch (err) {
			if (err instanceof ClientError) {
				console.info(interaction.user.tag + ' encounter this error ' + err.message + ' with ' + interaction.commandName + ' command in ' + interaction.guild!.name);
				interaction.followUp(err.message);
			}
			else { throw err; }
  	}
	},
};
