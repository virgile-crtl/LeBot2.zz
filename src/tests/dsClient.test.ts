import { Collection, GatewayIntentBits, REST, Routes } from 'discord.js';
import { Command } from '../types/command';
import { getVoiceConnection } from '@discordjs/voice';
import DsClient from '../dsClient';
import fs from 'fs';
import path from 'path';

jest.mock('discord.js', () => ({
	...jest.requireActual('discord.js'),
	REST: jest.fn(),
	Routes: {
	  applicationGuildCommands: jest.fn((a, b) => a + b),
	  applicationCommands: jest.fn((a) => a),
	},
}));

describe('DsClient', () => {
	const dsClient: DsClient = new DsClient({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });
	const spyConsole = jest.spyOn(console, 'info').mockImplementation(() => {return;});


	beforeAll(() => {
		fs.mkdirSync(process.env.CMDS_FOLDER!, { recursive: true });
		fs.writeFileSync(path.join(process.env.CMDS_FOLDER!, 'testFile1.ts'), `
			import { SlashCommandBuilder } from "discord.js";
  		export default {
    		data: new SlashCommandBuilder().setName("fileonets").setDescription("fileonets"),
    		async execute() {}
  		};`,
		);
		fs.writeFileSync(path.join(process.env.CMDS_FOLDER!, 'testFile2.ts'), `
			import { SlashCommandBuilder } from "discord.js";
  		export default {
    		data: new SlashCommandBuilder().setName("filetwots").setDescription("filetwots"),
    		async execute() {},
				async autocomplete() {}
  		};`,
		);
		fs.writeFileSync(path.join(process.env.CMDS_FOLDER!, 'testFile3.ts'), `
			import { SlashCommandBuilder } from "discord.js";
  		export default {
    		data: new SlashCommandBuilder().setName("filethreets").setDescription("filethreets"),
    		async execute() {}
  		};`,
		);
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
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		fs.rmSync(process.env.TEST_FOLDER!, { recursive: true, force: true });
	});

	test('Create Instance', () => {
		const res = new DsClient({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });
		expect(res).toBeInstanceOf(DsClient);
		expect((res as any)._commands).toEqual(new Collection<string, Command>());
	});

	test('GetCommandList in Dev mode', () => {
		expect((dsClient as any).getCommandsList('dev')).toEqual(['testFile1.ts', 'testFile2.ts', 'testFile3.ts']);
	});

	test('GetCommandList in Prod mode', () => {
		expect((dsClient as any).getCommandsList('prod')).toEqual(['testFile1.js', 'testFile2.js', 'testFile3.js']);
	});

	test('loadCommands in Dev mode', async () => {
		const res: Command[] = await (dsClient as any).loadCommands('dev');

		expect(res).toHaveLength(3);
		expect(res[0]).toHaveProperty('data');
		expect(res[0]).toHaveProperty('execute');
		expect(res[1]).toHaveProperty('data');
		expect(res[1]).toHaveProperty('execute');
		expect(res[2]).toHaveProperty('data');
		expect(res[2]).toHaveProperty('execute');
	});

	test('loadCommands in Prod mode', async () => {
		const res: Command[] = await (dsClient as any).loadCommands('prod');

		expect(res).toHaveLength(3);
		expect(res[0]).toHaveProperty('data');
		expect(res[0]).toHaveProperty('execute');
		expect(res[1]).toHaveProperty('data');
		expect(res[1]).toHaveProperty('execute');
		expect(res[2]).toHaveProperty('data');
		expect(res[2]).toHaveProperty('execute');
	});

	test('Deploy Commands in Dev mode', async () => {
		const cmds: Command[] = await (dsClient as any).loadCommands('dev');
		const restMock: REST = {
			setToken: jest.fn().mockReturnThis(),
			put: jest.fn(),
		} as unknown as REST;
		(REST as any as jest.Mock).mockReturnValue(restMock);

		await (dsClient as any).deployCommands(cmds, 'dev');
		expect(REST).toHaveBeenCalledTimes(1);
		expect(REST).toHaveBeenCalledWith({ version: '10' });
		expect(restMock.setToken).toHaveBeenCalledTimes(1);
		expect(restMock.setToken).toHaveBeenCalledWith(process.env.BOT_TOKEN);
		expect(Routes.applicationGuildCommands).toHaveBeenCalledTimes(2);
		expect(Routes.applicationGuildCommands).toHaveBeenCalledWith(process.env.CLIENT_ID, process.env.GUILD_ID);
		expect(restMock.put).toHaveBeenCalledTimes(2);
		expect(restMock.put).toHaveBeenCalledWith(process.env.CLIENT_ID! + process.env.GUILD_ID!, { body: [] });
		expect(restMock.put).toHaveBeenCalledWith(process.env.CLIENT_ID! + process.env.GUILD_ID!, { body: cmds.map(cmd => cmd.data.toJSON()) });
		expect(spyConsole).toHaveBeenCalledTimes(2);
		expect(spyConsole).toHaveBeenCalledWith('init.cmdsRemoved');
		expect(spyConsole).toHaveBeenCalledWith('init.deploySuccess');
	});

	test('Deploy Commands in Prod mode', async () => {
		const cmds: Command[] = await (dsClient as any).loadCommands('dev');
		const restMock: REST = {
			setToken: jest.fn().mockReturnThis(),
			put: jest.fn(),
		} as unknown as REST;
		(REST as any as jest.Mock).mockReturnValue(restMock);

		await (dsClient as any).deployCommands(cmds, 'prod');
		expect(REST).toHaveBeenCalledTimes(1);
		expect(REST).toHaveBeenCalledWith({ version: '10' });
		expect(restMock.setToken).toHaveBeenCalledTimes(1);
		expect(restMock.setToken).toHaveBeenCalledWith(process.env.BOT_TOKEN);
		expect(Routes.applicationCommands).toHaveBeenCalledTimes(2);
		expect(Routes.applicationCommands).toHaveBeenCalledWith(process.env.CLIENT_ID);
		expect(restMock.put).toHaveBeenCalledTimes(2);
		expect(restMock.put).toHaveBeenCalledWith(process.env.CLIENT_ID!, { body: [] });
		expect(restMock.put).toHaveBeenCalledWith(process.env.CLIENT_ID!, { body: cmds.map(cmd => cmd.data.toJSON()) });
		expect(spyConsole).toHaveBeenCalledTimes(2);
		expect(spyConsole).toHaveBeenCalledWith('init.cmdsRemoved');
		expect(spyConsole).toHaveBeenCalledWith('init.deploySuccess');
	});

	test('Init in Dev mode without --deploy', async () => {
		const loadSpy = jest.spyOn(dsClient as any, 'loadCommands');
		const deploySpy = jest.spyOn(dsClient as any, 'deployCommands');
		const spySet = jest.spyOn((dsClient as any)._commands, 'set');
		process.env.NODE_ENV = 'dev';

		await dsClient.init();
		expect((dsClient as any)._commands.size).toBe(3);
		expect((dsClient as any)._commands.has('fileonets')).toBe(true);
		expect((dsClient as any)._commands.has('filetwots')).toBe(true);
		expect((dsClient as any)._commands.has('filethreets')).toBe(true);
		expect(spySet).toHaveBeenCalledTimes(3);
		expect(spySet).toHaveBeenCalledWith('fileonets', expect.any(Object));
		expect(spySet).toHaveBeenCalledWith('filetwots', expect.any(Object));
		expect(spySet).toHaveBeenCalledWith('filethreets', expect.any(Object));
		expect(spyConsole).toHaveBeenCalledTimes(3);
		expect(spyConsole).toHaveBeenCalledWith('init.cmdLoaded');
		expect(spyConsole).toHaveBeenCalledWith('init.cmdLoaded');
		expect(spyConsole).toHaveBeenCalledWith('init.cmdLoaded');
		expect(loadSpy).toHaveBeenCalledTimes(1);
		expect(loadSpy).toHaveBeenCalledWith('dev');
		expect(deploySpy).toHaveBeenCalledTimes(0);
	});

	test('Init in Dev mode with --deploy', async () => {
		process.argv.push('--deploy');
		const loadSpy = jest.spyOn(dsClient as any, 'loadCommands');
		const deploySpy = jest.spyOn(dsClient as any, 'deployCommands');
		const spySet = jest.spyOn((dsClient as any)._commands, 'set');
		process.env.NODE_ENV = 'dev';

		await dsClient.init();
		expect((dsClient as any)._commands.size).toBe(3);
		expect((dsClient as any)._commands.has('fileonets')).toBe(true);
		expect((dsClient as any)._commands.has('filetwots')).toBe(true);
		expect((dsClient as any)._commands.has('filethreets')).toBe(true);
		expect(spySet).toHaveBeenCalledTimes(3);
		expect(spySet).toHaveBeenCalledWith('fileonets', expect.any(Object));
		expect(spySet).toHaveBeenCalledWith('filetwots', expect.any(Object));
		expect(spySet).toHaveBeenCalledWith('filethreets', expect.any(Object));
		expect(spyConsole).toHaveBeenCalledTimes(5);
		expect(spyConsole).toHaveBeenCalledWith('init.cmdLoaded');
		expect(spyConsole).toHaveBeenCalledWith('init.cmdLoaded');
		expect(spyConsole).toHaveBeenCalledWith('init.cmdLoaded');
		expect(loadSpy).toHaveBeenCalledTimes(1);
		expect(loadSpy).toHaveBeenCalledWith('dev');
		expect(deploySpy).toHaveBeenCalledTimes(1);
	});

	test('Init in Prod mode', async () => {
		const loadSpy = jest.spyOn(dsClient as any, 'loadCommands');
		const deploySpy = jest.spyOn(dsClient as any, 'deployCommands');
		const spySet = jest.spyOn((dsClient as any)._commands, 'set');
		process.env.NODE_ENV = 'prod';

		await dsClient.init();
		expect((dsClient as any)._commands.size).toBe(6);
		expect((dsClient as any)._commands.has('fileonejs')).toBe(true);
		expect((dsClient as any)._commands.has('filetwojs')).toBe(true);
		expect((dsClient as any)._commands.has('filethreejs')).toBe(true);
		expect(spySet).toHaveBeenCalledTimes(3);
		expect(spySet).toHaveBeenCalledWith('fileonejs', expect.any(Object));
		expect(spySet).toHaveBeenCalledWith('filetwojs', expect.any(Object));
		expect(spySet).toHaveBeenCalledWith('filethreejs', expect.any(Object));
		expect(spyConsole).toHaveBeenCalledTimes(5);
		expect(spyConsole).toHaveBeenCalledWith('init.cmdLoaded');
		expect(spyConsole).toHaveBeenCalledWith('init.cmdLoaded');
		expect(spyConsole).toHaveBeenCalledWith('init.cmdLoaded');
		expect(loadSpy).toHaveBeenCalledTimes(1);
		expect(loadSpy).toHaveBeenCalledWith('prod');
		expect(deploySpy).toHaveBeenCalledTimes(1);
	});

	test('GetCommand without autocomplete', () => {
		const spyGet = jest.spyOn((dsClient as any)._commands, 'get');
		const spyHas = jest.spyOn((dsClient as any)._commands, 'has');
		const command_name = 'fileonets';

		(dsClient as any).loadCommands('dev');
		const res = (dsClient as any).getCommand(command_name);
		expect(res).toHaveProperty('data');
		expect(res).toHaveProperty('execute');
		expect(spyHas).toHaveBeenCalledTimes(1);
		expect(spyHas).toHaveBeenCalledWith(command_name);
		expect(spyGet).toHaveBeenCalledTimes(1);
		expect(spyGet).toHaveBeenCalledWith(command_name);
	});

	test('GetCommand with autocomplete', () => {
		const spyGet = jest.spyOn((dsClient as any)._commands, 'get');
		const spyHas = jest.spyOn((dsClient as any)._commands, 'has');
		const command_name = 'filetwojs';

		(dsClient as any).loadCommands('prod');
		const res = (dsClient as any).getCommand(command_name);
		expect(res).toHaveProperty('data');
		expect(res).toHaveProperty('execute');
		expect(res).toHaveProperty('autocomplete');
		expect(spyHas).toHaveBeenCalledTimes(1);
		expect(spyHas).toHaveBeenCalledWith(command_name);
		expect(spyGet).toHaveBeenCalledTimes(1);
		expect(spyGet).toHaveBeenCalledWith(command_name);
	});

	test('CheckIfSomeoneIsHere with nobody in channel', async () => {
		const guild_id = 'guild1';
		const mockConnection = {
			joinConfig: {
				channelId: 'channel1',
			},
		};
		const mockChannel = {
			isVoiceBased: jest.fn().mockReturnValue(true),
			members: {
				size: 0,
			},
		};
		(getVoiceConnection as jest.Mock).mockReturnValue(mockConnection);
		(dsClient as any).channels.fetch = jest.fn().mockResolvedValue(mockChannel);


		expect(await dsClient.checkIfSomeoneIsHere(guild_id)).toBe(false);
		expect(getVoiceConnection).toHaveBeenCalledTimes(1);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect((dsClient as any).channels.fetch).toHaveBeenCalledTimes(1);
		expect((dsClient as any).channels.fetch).toHaveBeenCalledWith(mockConnection.joinConfig.channelId);
		expect(mockChannel.isVoiceBased).toHaveBeenCalledTimes(1);
	});

	test('CheckIfSomeoneIsHere with members in channel', async () => {
		const guild_id = 'guild1';
		const channel_id = 'channel1';
		const mockChannel = {
			isVoiceBased: jest.fn().mockReturnValue(true),
			members: {
				size: 2,
			},
		};
		const mockConnection = {
			joinConfig: {
				channelId: channel_id,
			},
		};
		(getVoiceConnection as jest.Mock).mockReturnValue(mockConnection);
		(dsClient as any).channels.fetch = jest.fn().mockResolvedValue(mockChannel);


		expect(await dsClient.checkIfSomeoneIsHere(guild_id)).toBe(true);
		expect(getVoiceConnection).toHaveBeenCalledTimes(1);
		expect(getVoiceConnection).toHaveBeenCalledWith(guild_id);
		expect((dsClient as any).channels.fetch).toHaveBeenCalledTimes(1);
		expect((dsClient as any).channels.fetch).toHaveBeenCalledWith(channel_id);
		expect(mockChannel.isVoiceBased).toHaveBeenCalledTimes(1);
	});
});