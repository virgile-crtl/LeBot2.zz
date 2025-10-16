import { Attachment } from 'discord.js';
import ClientError from '../clientError';
import fs from 'fs';
import https from 'https';
import i18next from 'i18next';
import path from 'path';
import ytdl, { Payload } from 'youtube-dl-exec';

async function getTrackName(url: string): Promise<string> {
	const info: Payload | string = await ytdl(url, {
		noPlaylist: true,
		dumpSingleJson: true,
	});
	if (typeof info === 'string') throw new ClientError(i18next.t('errors.music.nameError'));
	console.log(info.title);
	return info.title;
}

async function downloadTrackFromYoutube(url: string, outputDir: string): Promise<string> {
	const track_name: string = await getTrackName(url);
	await ytdl(url, {
		noPlaylist: true,
		extractAudio: true,
		audioFormat: 'mp3',
		output: path.join(outputDir, track_name + '.mp3'),
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
	return attachment.name.slice(0, -4);

}

export default async function downloadTrack(guild_folder: string, url: string | null, attachment: Attachment | null): Promise<string> {

	try {
		if (url) {
			return await downloadTrackFromYoutube(url, guild_folder);
		}
		else if (attachment) {
			return await downloadTrackFromAttachement(attachment, guild_folder);
		}
	}
	catch (err) {
		throw new ClientError(i18next.t('errors.music.downloadError'), err);
	}
	throw new ClientError(i18next.t('errors.music.paramError'));
}