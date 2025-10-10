import { Collection, GatewayIntentBits } from 'discord.js';
import { Command } from '../types/command';

import DsClient from '../dsClient';
import fs from 'fs';
import path from 'path';

describe('DsClient', () => {
	const dsClient: DsClient = new DsClient({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });

	beforeAll(() => {
		fs.mkdirSync(process.env.CMDS_FOLDER!, { recursive: true });
		fs.writeFileSync(path.join(process.env.CMDS_FOLDER!, 'testFile1.ts'), '');
		fs.writeFileSync(path.join(process.env.CMDS_FOLDER!, 'testFile2.ts'), '');
		fs.writeFileSync(path.join(process.env.CMDS_FOLDER!, 'testFile3.ts'), '');
		fs.writeFileSync(path.join(process.env.CMDS_FOLDER!, 'testFile1.js'), '');
		fs.writeFileSync(path.join(process.env.CMDS_FOLDER!, 'testFile2.js'), '');
		fs.writeFileSync(path.join(process.env.CMDS_FOLDER!, 'testFile3.js'), '');
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

	// test('loadCommands', async () => {
	// 	const res: Command[] = await (dsClient as any).loadCommands('dev');

	// 	expect(res).toBe(true);
	// });


	// test('GetCommand', () => {
	// 	const spyGet = jest.spyOn((dsClient as any)._commands, 'get');
	// 	const spyHas = jest.spyOn((dsClient as any)._commands, 'has');
	// 	(dsClient as any)._commands

	// 	dsClient.getCommand('add');
	// });
});