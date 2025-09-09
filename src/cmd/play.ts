import "dotenv/config"
import { AutocompleteInteraction, Guild, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import path from 'path';
import fs from 'fs';
import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, CreateVoiceConnectionOptions, getVoiceConnection, joinVoiceChannel, JoinVoiceChannelOptions, VoiceConnection } from '@discordjs/voice';
import { dbClient } from '../index';
import GuildVoice from '../types/guildVoice';

function createConnection(options: CreateVoiceConnectionOptions & JoinVoiceChannelOptions, songPath: string, guildId: string): AudioPlayer {
	const connection: VoiceConnection = joinVoiceChannel(options);
  const player: AudioPlayer = createAudioPlayer();
  player.play(createAudioResource(songPath));
  connection.subscribe(player);
  player.on(AudioPlayerStatus.Idle, () => playerIdle(guildId));
	return player
}

function checkErrors(interaction: ChatInputCommandInteraction):
asserts interaction is ChatInputCommandInteraction & { guild: Guild;
guildId: string; member: GuildMember & { voice: { channelId: string } };} {
	if (!interaction.member || !(interaction.member instanceof GuildMember)  || !interaction.member.voice.channelId)
		throw Error('you need to be in a voice channel to use this command.');
	if (!interaction.guildId || !interaction.guild)
		throw Error('this command can only be used in a server.');

	const Path = path.join(process.env.SONG_FOLDER!, interaction.guildId);

	if (!fs.existsSync(Path))
		throw Error('there are no songs in this server.');
	if (!fs.existsSync(path.join(Path, interaction.options.getString('song') + '.mp3')))
		throw Error(interaction.options.getString('song') + ' does not exist.');
}

function playerIdle(guildId: string) {
	const guildVoice: GuildVoice | undefined = dbClient.getGuildVoice(guildId)
	if (guildVoice) {
		if (guildVoice.shuffle) {
			guildVoice.player.play(createAudioResource(path.join(
			process.env.SONG_FOLDER!, guildId, dbClient.getNextSong(guildId) + '.mp3')));
		} else {
			dbClient.deleteGuildVoice(guildId)
			const connection = getVoiceConnection(guildId);
			if (connection) connection.destroy();
		}
	}
}

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

	async autocomplete(interaction: AutocompleteInteraction) {
		if (!interaction.guildId) return;
		const fp: string = path.join(process.env.SONG_FOLDER!, interaction.guildId);
		if (!fs.existsSync(fp)) {
			return interaction.respond([{ name: 'there are no songs in this server.', value: 'there are no songs in this server.' }]);
		}
		const focusedValue: string = interaction.options.getFocused();
		const songsList: string[] = fs.readdirSync(fp)
			.filter(file => file.endsWith('.mp3'))
			.map(choice => choice.substring(0, choice.length - 4))
			.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()));
		if (songsList.length > 25)
			await interaction.respond(songsList
				.slice(0,25)
				.map(choice => ({ name: choice, value: choice })));
		else
			await interaction.respond(songsList.map(choice => ({ name: choice, value: choice })));
	},

	async execute(interaction: ChatInputCommandInteraction) {
		try {
			checkErrors(interaction);
			let shuf: boolean | null = interaction.options.getBoolean('shuffle');
			if (!shuf)
				shuf = true;
			else
				shuf = shuf;
			if (!getVoiceConnection(interaction.guildId)) {
				if (dbClient.getGuildVoice(interaction.guildId))
					dbClient.deleteGuildVoice(interaction.guildId);
				const player: AudioPlayer = createConnection({
					channelId: interaction.member.voice.channelId,
					guildId: interaction.guildId,
					adapterCreator: interaction.guild.voiceAdapterCreator,
					},  path.join(process.env.SONG_FOLDER!, interaction.guildId, interaction.options.getString('song') + '.mp3'), interaction.guildId);
				dbClient.createGuildVoice(interaction.guildId, shuf, player);
				return interaction.reply("I am playing " + interaction.options.getString('song'));
			} else {
				dbClient.addSongToQueue(interaction.guildId, interaction.options.getString('song')!);
				if (interaction.options.getBoolean('shuffle'))
					dbClient.updateShuffle(interaction.guildId, interaction.options.getBoolean('shuffle')!);
				return interaction.reply(`I added "${interaction.options.getString('song')}" to the queue.`);
			}
		} catch (error) {
			if (error instanceof Error) {
				return interaction.reply(error.message);
			}
		}
	},
};
