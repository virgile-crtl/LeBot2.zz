import { Attachment, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import ClientError from '../clientError';
import DsClient from '../dsClient';
import fs from 'fs';
import GuildPlayer from '../guildPlayer';
import https from 'https';
import i18next from 'i18next';
import path from 'path';
import PlayerService from '../playerService';
import ytdl, { Payload } from 'youtube-dl-exec';

async function getTrackName(url: string) {
	const info: Payload | string = await ytdl(url, {
		noPlaylist: true,
	  dumpSingleJson: true,
	});
	if (typeof info === 'string') return;
	console.log(info.title);
}

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
		throw new ClientError(i18next.t('errors.music.downloadError'), err);
	}
	const stdot = output.toString().match(/\[ExtractAudio\] Destination: (.+\.mp3)/);
	if (!stdot || !stdot[1]) throw new ClientError(i18next.t('errors.music.paramError'));
	return path.basename(stdot[1]).slice(0, -4);
}

function downloadTrackFromAttachement(url: string, track_path: string) {
	return new Promise<void>((resolve, reject) => {
  	const f = fs.createWriteStream(track_path);
  	https.get(url, r => {
      	r.pipe(f).on('finish', () => f.close(() => resolve()));
  	  }).on('error', reject);
	});
}

export default {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Adds a track to the bot.')
		.addStringOption(option =>
			option
				.setName('url')
				.setDescription('The url of the track you want to add.')
				.setRequired(false),
		)
		.addAttachmentOption(option =>
  		option
				.setName('track')
      	.setDescription('Add your own track')
      	.setRequired(false),
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

		const url: string | null = interaction.options.getString('url');
		const attachment: Attachment | null = interaction.options.getAttachment('track');
		let track_name: string;

		if (url) {
  		interaction.reply(i18next.t('music.startDownload'));
			await getTrackName(url);
			track_name = await downloadTrackFromYoutube(url, guild_folder);
			interaction.editReply(i18next.t('music.downloadCompleted'));
		}
		else if (attachment) {
  		interaction.reply(i18next.t('music.startDownload'));
			track_name = attachment.name.slice(0, -4);
			await downloadTrackFromAttachement(attachment.url, path.join(guild_folder, track_name + '.mp3'));
			interaction.editReply(i18next.t('music.downloadCompleted'));
			console.log(track_name);
		}
		else { throw new ClientError(i18next.t('paramError')); }

		if (!interaction.channel || !interaction.channel.isTextBased()) {
			throw new ClientError(i18next.t('errors.cmd.commandInTextChannel'));
		}
		const to_queue = interaction.options.getBoolean('to_queue') ?? true;
		if (to_queue && (interaction.member && (interaction.member instanceof GuildMember)
		&& interaction.member.voice.channelId)) {
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
				await interaction.followUp(i18next.t('music.play', { trackName: track_name }));
			}
			else {
				PlayerService.getInstance().updatePlayer(track_name, interaction.guildId,
					interaction.channelId, interaction.options.getBoolean('rand'));
				await interaction.followUp(i18next.t('music.trackAdd', { trackName: track_name }));
			}
		}
	},
};

