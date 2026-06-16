import { Attachment } from 'discord.js';
import ClientError from '../clientError';
import fs from 'fs';
import https from 'https';
import i18next from 'i18next';
import path from 'path';
import ytdl, { Payload } from 'youtube-dl-exec';
import { dbclient } from '../dbclient';

async function getTrackName(url: string): Promise<string> {
	const info: Payload | string = await ytdl(url, {
		noPlaylist: true,
		dumpSingleJson: true,
	});
	if (typeof info === 'string') throw new ClientError(i18next.t('errors.music.nameError'));
	return info.title;
}

async function downloadTrackFromYoutube(url: string): Promise<string> {
	const track_name: string = await getTrackName(url);
	await ytdl(url, {
		noPlaylist: true,
		extractAudio: true,
		audioFormat: 'mp3',
		output: path.join(process.env.MUSIC_FOLDER!, track_name + '.mp3'),
	});
	return track_name;
}

async function downloadTrackFromAttachement(attachment: Attachment, guild_folder: string): Promise<string> {
	await new Promise<void>((resolve, reject) => {
		const f = fs.createWriteStream(path.join(guild_folder, attachment.name));
		https.get(attachment.url, r => {
			r.pipe(f).on('finish', () => f.close(() => resolve()));
		}).on('error', reject);
	});
	return attachment.name.substring(0, attachment.name.lastIndexOf('.')) || attachment.name;
}

export default async function downloadTrack(guildId: string, url: string | null, attachment: Attachment | null): Promise<string> {
	try {
		if (url) {
			const track_name: string = await downloadTrackFromYoutube(url);
			await dbclient.music.create({
				data: {
					title: track_name,
					path: path.join(process.env.MUSIC_FOLDER!, track_name + '.mp3'),
					guilds: {
						connect: {
							guildId: guildId,
						},
					},
				},
			});
		}
		else if (attachment) {
			return await downloadTrackFromAttachement(attachment, path.join(process.env.MUSIC_FOLDER!, guildId));
		}
	}
	catch (err) {
		throw new ClientError(i18next.t('errors.music.downloadError'), err);
	}
	throw new ClientError(i18next.t('errors.music.paramError'));
}