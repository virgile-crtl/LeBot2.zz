import "dotenv/config"
import { AutocompleteInteraction, Guild, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { dbClient } from '../index';
import voiceClient from "../voiceClient";
import { getVoiceConnection } from "@discordjs/voice";
import ClientError from "../clientError";
import { error } from "console";

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

	async autocomplete(interaction: AutocompleteInteraction<"cached">) {
		try {
			const focusedValue: string = interaction.options.getFocused();
			const songsList: string[] = dbClient.getAllsongs(interaction.guildId)
				.filter(songsList => songsList.includes(focusedValue.toLowerCase()))
			if (songsList.length > 25)
				await interaction.respond(songsList.slice(0,25)
					.map(choice => ({ name: choice, value: choice })));
			else
				await interaction.respond(songsList.map(choice => ({ name: choice, value: choice })));
		} catch (err)  {
			if (err instanceof ClientError) {
				console.info(interaction.user.tag + 'encounter this error ' + err.message +' with ' + interaction.commandName + ' command in ' + interaction.guild!.name)
				interaction.respond([{ name: err.message, value: err.message }]);
			} else {
				interaction.respond([{ name: 'error while listing files', value: 'error while listing files' }]);
				console.error(err);
			}
		}
	},

	async execute(interaction: ChatInputCommandInteraction<"cached">) {
		try {
			const Path = path.join(process.env.SONG_FOLDER!, interaction.guildId);
			if (!fs.existsSync(Path))
				throw new ClientError('there are no songs in this server.');
			if (!fs.existsSync(path.join(Path, interaction.options.getString('song') + '.mp3')))
				throw new ClientError(interaction.options.getString('song') + ' does not exist.');
			if (!getVoiceConnection(interaction.guildId)) {
				dbClient.createGuildVoice(interaction.guildId,
					interaction.options.getBoolean('shuffle') ?? true,
					voiceClient.play(interaction, interaction.options.getString('song')!));
				return interaction.reply('I am playing ' + interaction.options.getString('song'));
			} else {
				dbClient.addSongToQueue(interaction.guildId, interaction.options.getString('song')!);
				if (interaction.options.getBoolean('shuffle') != null)
					dbClient.updateShuffle(interaction.guildId, interaction.options.getBoolean('shuffle')!);
				return interaction.reply('I added ' + interaction.options.getString('song') + ' to the queue.');
			}
		} catch (err) {
			if (err instanceof ClientError) {
				console.info(interaction.user.tag + 'encounter this error ' + err.message +' with ' + interaction.commandName + ' command in ' + interaction.guild!.name)
				interaction.reply(err.message);
			} else
				throw err
		}
	},
};
