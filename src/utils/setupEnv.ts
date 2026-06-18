import dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev' });

import path from 'path';
import fs from 'fs';

function isRunningInDocker(): boolean {
	return fs.existsSync('/.dockerenv');
}

export default function setdefaultEnvVars(): void {
	process.env.MUSIC_FOLDER = path.resolve(isRunningInDocker() ? '/mnt/music' : 'music');
	process.env.TRANSLATION_FOLDER = path.resolve('locales');
	process.env.CMDS_FOLDER = process.env.NODE_ENV === 'prod' ? path.resolve('dist/cmd') : path.resolve('src/cmd');
}