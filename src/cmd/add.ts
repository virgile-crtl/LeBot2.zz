import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import yt from 'yt-converter';
import path from 'path';
import fs from 'fs';
import manageConnection from '../utils/manageConnection.ts';


module.exports = {
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
				.setName('random')
				.setDescription('Whether or not you want to play a random song.')
				.setRequired(false),
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const Path = path.join(__dirname, '../../song/' + interaction.guildId);
		if (!fs.existsSync(Path)) {
			fs.mkdirSync(Path);
		}
		console.log(Path);
		if (interaction.options.getString('url').includes('youtube')) {
			res = await yt.convertAudio({
				url: interaction.options.getString('url'),
				itag: 140,
				directoryDownload: Path,
			}).then((res) => {
				console.log(res);
				return res;
			}).catch((err) => {
				console.log(err);
				return interaction.reply('There was an error adding the song.');
			});
		} if (interaction.options.getBoolean('toqueue')) {
			return manageConnection(interaction, Path, res);
		}
		return interaction.reply('I am adding the song.');
	},
};
