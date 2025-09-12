import ClientError from '../clientError';
import fs from 'fs';
import path from 'path';

export default function getAllTracks(guildId: string): string[] {
	const fp: string = path.join(process.env.SONG_FOLDER!, guildId);
	if (!fs.existsSync(fp)) {
		throw new ClientError('there are no songs in this server.');
	}
	const songsList: string[] = fs.readdirSync(fp)
		.filter(file => file.endsWith('.mp3'))
		.map(choice => choice.substring(0, choice.length - 4));
	if (songsList.length <= 0) {
		throw new ClientError('there are no songs in this server.');
	}
	return songsList;
}