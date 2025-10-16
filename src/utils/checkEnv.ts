import fs from 'fs';
import path from 'path';

function getEnvVars(): Array<{ name: string, is_folder?: boolean }> {
	if (process.env.NODE_ENV === 'prod') {
		return [
			{ name: 'BOT_TOKEN' },
			{ name: 'CLIENT_ID' },
			{ name: 'TRANSLATION_FOLDER', is_folder: true },
			{ name: 'CMDS_FOLDER', is_folder: true },
			{ name: 'PLAYLISTS_FOLDER', is_folder: true },
			{ name: 'LANGUAGE' },
		];
	}
	else {
		return [
			{ name: 'BOT_TOKEN' },
			{ name: 'CLIENT_ID' },
			{ name: 'GUILD_ID' },
			{ name: 'TRANSLATION_FOLDER', is_folder: true },
			{ name: 'CMDS_FOLDER', is_folder: true },
			{ name: 'PLAYLISTS_FOLDER', is_folder: true },
			{ name: 'LANGUAGE' },
		];
	}
}

export default function checkEnv(): void {
	const envVars: Array<{ name: string, is_folder?: boolean }> = getEnvVars();

	for (const envVar of envVars) {
		const value = process.env[envVar.name];
		if (!value) {
			console.error('The environment variable ' + envVar.name + ' is not defined');
			process.exit(1);
		}
		else if (envVar.is_folder) {
			try {
				fs.existsSync(path.resolve(value));
				fs.statSync(path.resolve(value)).isDirectory();
			}
			catch {
				console.error('The folder specified by ' + envVar.name + ' does not exist or is not a directory: ' + path.resolve(value));
				process.exit(1);
			}
		}
	};
}

