import path from 'path';

export default function setdefaultEnvVars(): void {
	process.env.MUSIC_FOLDER = path.resolve('music');
	process.env.TRANSLATION_FOLDER = path.resolve('locales');
	process.env.CMDS_FOLDER = process.env.NODE_ENV === 'prod' ? path.resolve('dist/cmd') : path.resolve('src/cmd');
}