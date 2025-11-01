import fs from 'fs';
import path from 'path';

export default function setdefaultEnvVars(): void {
	process.env.TRANSLATION_FOLDER = path.resolve('locales');
	process.env.CMDS_FOLDER = process.env.NODE_ENV === 'prod' ? path.resolve('dist/cmd') : path.resolve('src/cmd');
	if (process.env.PLAYLISTS_FOLDER && !fs.existsSync(process.env.PLAYLISTS_FOLDER)) {
		fs.mkdirSync(process.env.PLAYLISTS_FOLDER!, { recursive: true });
	}
}