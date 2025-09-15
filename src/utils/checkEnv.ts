import fs from 'fs';
import path from 'path';

function getEnvVars(): Array<{ name: string, is_folder?: boolean }> {
	if (process.env.NODE_ENV === 'prod') {
		return [
			{ name: 'BOT_TOKEN' },
			{ name: 'GUILD_ID' },
			{ name: 'CMDS_FOLDER', is_folder: true },
			{ name: 'PLAYLISTS_FOLDER', is_folder: true },
		];
	}
	else {
		return [
			{ name: 'BOT_TOKEN' },
			{ name: 'CLIENT_ID' },
			{ name: 'GUILD_ID' },
			{ name: 'CMDS_FOLDER', is_folder: true },
			{ name: 'PLAYLISTS_FOLDER', is_folder: true },
		];
	}
}

export default function checkEnv(): void {
	const envVars: Array<{ name: string, is_folder?: boolean }> = getEnvVars();

	for (const envVar of envVars) {
		const value = process.env[envVar.name];
		if (!value) {
			console.error('La variable d\'environnement ' + envVar.name + ' n\'est pas définie');
			process.exit(1);
		}
		else if (envVar.is_folder && !fs.existsSync(path.resolve(value)) && !fs.statSync(path.resolve(value)).isDirectory()) {
			console.error('Le dossier spécifié par ' + envVar.name + ' n\'existe pas ou n\'est pas un dossier : ' + path.resolve(value));
			process.exit(1);
		}
	};
}