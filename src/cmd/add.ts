import "dotenv/config"
import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, CreateVoiceConnectionOptions, getVoiceConnection, joinVoiceChannel, JoinVoiceChannelOptions, VoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { dbClient } from '../index'
import GuildVoice from '../types/guildVoice'
import path from 'path';
import fs from 'fs';
import ytdl from 'youtube-dl-exec'
import { exec, Flags} from "youtube-dl-exec";
import { stdout } from "process";

function createConnection(options: CreateVoiceConnectionOptions & JoinVoiceChannelOptions, songPath: string, guildId: string): AudioPlayer {
	const connection: VoiceConnection = joinVoiceChannel(options);
  const player: AudioPlayer = createAudioPlayer();
  player.play(createAudioResource(songPath));
  connection.subscribe(player);
  player.on(AudioPlayerStatus.Idle, () => playerIdle(guildId));
	return player
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

	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.guildId || !interaction.guild)
			return interaction.reply('This command can only be used in a server.');
		const songPath = path.join(process.env.SONG_FOLDER! + interaction.guildId);
		if (!fs.existsSync(songPath)) {
			fs.mkdirSync(songPath);
		}

		let output: any

		try {
    	interaction.reply("Lancement du téléchargement");
			output = await ytdl(interaction.options.getString('url')!, {
				noPlaylist: true,
				extractAudio: true,
      	audioFormat: 'mp3',
      	output: path.join(process.env.SONG_FOLDER!, interaction.guildId, '%(title)s - %(artist)s.%(ext)s'),
    	});
			await interaction.editReply("✅ Téléchargement terminé !");
		} catch (err) {
    	interaction.editReply("Erreur lors du téléchargement");
  	}
		if (!interaction.options.getBoolean('toqueue'))
			return;



		const stdot = output.toString().match(/\[ExtractAudio\] Destination: (.+\.mp3)/);
		if (!stdot || !stdot[1]) throw Error();
		const songName = path.basename(stdot[1]).slice(0, -4);


		console.log()
		if (fs.existsSync(path.join(process.env.SONG_FOLDER!, interaction.guildId, songName +'.mp3'))) {
  		console.log("Le fichier existe !");
		} else {
  		console.log("Le fichier n'existe pas.");
		}


		if (!interaction.member || !(interaction.member instanceof GuildMember)  || !interaction.member.voice.channelId)
			return await interaction.followUp('you need to be in a voice channel to play song.')
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
					},  path.join(process.env.SONG_FOLDER!, interaction.guildId, songName +'.mp3'), interaction.guildId);
				dbClient.createGuildVoice(interaction.guildId, shuf, player);
		} else {
			dbClient.addSongToQueue(interaction.guildId, songName);
			if (interaction.options.getBoolean('shuffle'))
				dbClient.updateShuffle(interaction.guildId, interaction.options.getBoolean('shuffle')!);
		}
	},
};
