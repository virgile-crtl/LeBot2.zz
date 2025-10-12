import { GatewayIntentBits } from 'discord.js';
import DsClient from '../dsClient';
import fs from 'fs';
import path from 'path';
import { getVoiceConnection } from '@discordjs/voice';

jest.mock('discord.js', () => ({
	...jest.requireActual('discord.js'),
	REST: jest.fn().mockImplementation(() => { throw new Error('Test error'); }),
}));

describe('DsClient', () => {
	const dsClient: DsClient = new DsClient({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });

	beforeAll(() => {
		jest.spyOn(console, 'info').mockImplementation(() => { return; });
		fs.mkdirSync(process.env.CMDS_FOLDER!, { recursive: true });
	});

	afterAll(() => {
		fs.rmSync(process.env.CMDS_FOLDER!, { recursive: true, force: true });
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('GetCommandList get empty list', () => {
		expect(() => (dsClient as any).getCommandsList('dev')).toThrow('errors.init.noCmdsFound');
	});

	test('GetCommandList get empty list', () => {
		expect(() => (dsClient as any).getCommandsList('prod')).toThrow('errors.init.noCmdsFound');
	});

	test('Error while deploying commands', async () => {
		await expect(() => (dsClient as any).deployCommands([], 'dev')).rejects.toThrow('errors.init.deployError\nTest error');
		await expect(() => (dsClient as any).deployCommands([], 'prod')).rejects.toThrow('errors.init.deployError\nTest error');
	});

	test('Init with missing command property', async () => {
		fs.writeFileSync(path.join(process.env.CMDS_FOLDER!, 'testFile1.js'), `
			const { SlashCommandBuilder } = require('discord.js');

			module.exports = {
				data: new SlashCommandBuilder().setName("fileonejs").setDescription("fileonejs"),
				async execute() {}
			};`,
		);
		fs.writeFileSync(path.join(process.env.CMDS_FOLDER!, 'testFile2.js'), `
			const { SlashCommandBuilder } = require('discord.js');

			module.exports = {
				data: new SlashCommandBuilder().setName('filetwojs').setDescription('filetwojs'),
				async execute() {},
				async autocomplete() {}
			};`,
		);
		fs.writeFileSync(path.join(process.env.CMDS_FOLDER!, 'testFile3.js'), `
			const { SlashCommandBuilder } = require('discord.js');

			module.exports = {
				data: new SlashCommandBuilder().setName('filethreejs').setDescription('filethreejs'),
				async execute() {},
			};`,
		);
		fs.writeFileSync(path.join(process.env.CMDS_FOLDER!, 'testFile4.js'), 'module.exports = {};');
		await expect(() => dsClient.init()).rejects.toThrow('errors.init.cmdMissingProperty');
		fs.rmSync(path.join(process.env.CMDS_FOLDER!, 'testFile4.js'));
	});

	test('GetCommand not found', () => {
		expect(() => dsClient.getCommand('notfound')).toThrow('errors.cmd.cmdNotFound');
	});

	test('CheckIfSomeoneIsHere not in a voice channel', async () => {
		const guild_id = 'guild1';
		(getVoiceConnection as jest.Mock).mockReturnValue(undefined);

		await expect(dsClient.checkIfSomeoneIsHere(guild_id)).rejects.toThrow('errors.music.notInServer');
		expect(getVoiceConnection).toHaveBeenCalledTimes(1);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
	});

	test('CheckIfSomeoneIsHere without channelId', async () => {
		const guild_id = 'guild1';
		const mockConnection = {
			joinConfig: {
			},
		};
		(getVoiceConnection as jest.Mock).mockReturnValue(mockConnection);
		(dsClient as any).channels.fetch = jest.fn();


		expect(await dsClient.checkIfSomeoneIsHere(guild_id)).toBe(false);
		expect(getVoiceConnection).toHaveBeenCalledTimes(1);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect((dsClient as any).channels.fetch).not.toHaveBeenCalled();
	});
});

