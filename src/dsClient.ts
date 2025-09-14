import { Client, ClientOptions, Collection, REST, Routes } from 'discord.js';
import { Command } from './types/command';
import ClientError from './clientError';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

export default class DsClient extends Client {
	commands: Collection<string, Command>;

	constructor(options: ClientOptions) {
		super(options);
		this.commands = new Collection<string, Command>();

	}

	async init() {
		const envType = process.env.NODE_ENV || 'dev';
		const cmds: Command[] = await this.loadCommands(envType);

		for (const cmd of cmds) {
			if (!('data' in cmd) || !('execute' in cmd)) {
				throw new ClientError(' command missing a required \'data\' or \'execute\' property.');
			}
			this.commands.set(cmd.data.name, cmd);
			console.info('Command ' + cmd.data.name + ' is loaded');
		}

		const deploy: boolean = envType === 'dev' ? await this.askDeploy() : true;
		if (deploy) { await this.deployCommands(cmds, envType); }
	}

	private getCommandsList(envType: string): string[] {
		const cmdFiles: string[] = fs.readdirSync(process.env.CMD_FOLDER!)
			.filter(file => file.endsWith(envType === 'dev' ? '.ts' : '.js'));
		if (cmdFiles.length <= 0) {
			throw new ClientError('None command found');
		}
		return cmdFiles;
	}

	private async loadCommands(envType: string): Promise<Command[]> {
		const cmds: Command[] = [];

		for (const file of this.getCommandsList(envType)) {
			const cmdModule = await import(path.join(process.env.CMD_FOLDER!, file));
			const cmd: Command = cmdModule.default || cmdModule;
			cmds.push(cmd);
		}
		return cmds;
	}

	private async deployCommands(cmds: Command[], envType: string) {
		try {
			const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);
			if (envType === 'dev') {
				await rest.put(Routes.applicationGuildCommands(
          process.env.CLIENT_ID!, process.env.GUILD_ID!), { body: [] });
				console.info('Successful remove Commands');
				await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!,
          process.env.GUILD_ID!), { body: cmds.map(cmd => cmd.data.toJSON()) });
			}
			else {
				await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: [] });
				console.info('Successful remove Commands');
				await rest.put(Routes.applicationCommands(
          process.env.CLIENT_ID!), { body: cmds.map(cmd => cmd.data.toJSON()) });
			}
			console.info('Successful deployment: ' + cmds.length + ' recorded commands.');
		}
		catch (err) {
			throw ClientError.fromError(err, 'Error during deployment');
		}
	}

	private askDeploy(): Promise<boolean> {
		const rl = readline.createInterface({
			input: process.stdin, output: process.stdout });

		return new Promise((resolve) => {
			rl.question('Do you want to deploy the orders? (y/n): ', (answer) => {
				rl.close();
				resolve(answer.trim().toLowerCase()[0] === 'y');
			});
		});
	}
}