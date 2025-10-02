import { Channel, Client, ClientOptions, Collection, REST, Routes } from 'discord.js';
import { Command } from './types/command';
import { getVoiceConnection, VoiceConnection } from '@discordjs/voice';
import langClient from './i18next';
import ClientError from './clientError';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

export default class DsClient extends Client {
	private _commands: Collection<string, Command>;

	constructor(options: ClientOptions) {
		super(options);
		this._commands = new Collection<string, Command>();
	}

 	public getCommand(command_name: string): Command {
		if (!this._commands.has(command_name)) {
			throw new ClientError(langClient.t('cmdNotFound', { commandName: command_name }));
		}
		return this._commands.get(command_name)!;
	}

	public async init(): Promise<void> {
		const env: string = process.env.NODE_ENV || 'dev';
		const cmds: Command[] = await this.loadCommands(env);

		for (const cmd of cmds) {
			if (!('data' in cmd) || !('execute' in cmd)) {
				throw new ClientError(langClient.t('cmdMissingProperty'));
			}
			this._commands.set(cmd.data.name, cmd);
			console.info(langClient.t('cmdLoaded', { commandName: cmd.data.name }));
		}

		const deploy: boolean = env === 'dev' ? await this.askForDeploy() : true;
		if (deploy) { await this.deployCommands(cmds, env); }
	}

	public async checkIfSomeoneIsHere(guild_id: string): Promise<boolean> {
		const connection: VoiceConnection | undefined = getVoiceConnection(guild_id);

		if (!connection) throw new ClientError(langClient.t('notInServer'));
		const channel: Channel | null = connection.joinConfig.channelId ? await this.channels.fetch(connection.joinConfig.channelId) : null;
		if (channel?.isVoiceBased() && channel.members.size > 1) { return true; }
		return false;
	}

	private getCommandsList(env: string): string[] {
		const cmd_files: string[] = fs.readdirSync(process.env.CMDS_FOLDER!)
			.filter(file => file.endsWith(env === 'dev' ? '.ts' : '.js'));
		if (cmd_files.length <= 0) { throw new ClientError(langClient.t('noCmdsFound')); }
		return cmd_files;
	}

	private async loadCommands(env: string): Promise<Command[]> {
		const cmds: Command[] = [];

		for (const file of this.getCommandsList(env)) {
			const cmdModule: any = await import(path.join(process.env.CMDS_FOLDER!, file));
			const cmd: Command = cmdModule.default || cmdModule;
			cmds.push(cmd);
		}
		return cmds;
	}

	private async deployCommands(cmds: Command[], envType: string): Promise<void> {
		try {
			const rest: REST = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);
			if (envType === 'dev') {
				await rest.put(Routes.applicationGuildCommands(
          process.env.CLIENT_ID!, process.env.GUILD_ID!), { body: [] });
				console.info(langClient.t('cmdsRemoved'));
				await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!,
          process.env.GUILD_ID!), { body: cmds.map(cmd => cmd.data.toJSON()) });
			}
			else {
				await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: [] });
				console.info(langClient.t('cmdsRemoved'));
				await rest.put(Routes.applicationCommands(
          process.env.CLIENT_ID!), { body: cmds.map(cmd => cmd.data.toJSON()) });
			}
			console.info(langClient.t('deploySuccess', { count: cmds.length }));
		}
		catch (err) {
			throw ClientError.fromError(err, langClient.t('deployError'));
		}
	}

	private async askForDeploy(): Promise<boolean> {
		const input: readline.Interface = readline.createInterface({
			input: process.stdin, output: process.stdout });

		return new Promise((resolve) => {
			input.question(langClient.t('deployPrompt'), (answer) => {
				input.close();
				resolve(answer.trim().toLowerCase()[0] === 'y');
			});
		});
	}
}