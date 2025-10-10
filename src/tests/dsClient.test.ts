import { Collection, GatewayIntentBits } from 'discord.js';
import { Command } from '../types/command';
import DsClient from '../dsClient';
import fs from 'fs';
import path from 'path';

describe('DsClient', () => {
	const dsClient: DsClient = new DsClient({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });

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
    		async execute() {}
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


	// test('GetCommand', () => {
	// 	const spyGet = jest.spyOn((dsClient as any)._commands, 'get');
	// 	const spyHas = jest.spyOn((dsClient as any)._commands, 'has');
	// 	(dsClient as any)._commands

	// 	dsClient.getCommand('add');
	// });
});