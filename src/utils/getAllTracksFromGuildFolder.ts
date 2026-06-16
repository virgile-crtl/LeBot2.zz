import ClientError from '../clientError';
import fs from 'fs';
import i18next from 'i18next';
import path from 'path';

export default function getAllTracksFromGuildFolder(guild_id: string): string[] {
	const guild_folder: string = path.join(process.env.MUSIC_FOLDER!, guild_id);
	if (!fs.existsSync(guild_folder)) {
		throw new ClientError(i18next.t('errors.music.noTracksInServer'));
	}
	const tracks_list: string[] = fs.readdirSync(guild_folder)
		.filter(file => file.endsWith('.mp3'))
		.map(choice => choice.substring(0, choice.length - 4));
	if (tracks_list.length <= 0) {
		throw new ClientError(i18next.t('errors.music.noTracksInServer'));
	}
	return tracks_list;
}
