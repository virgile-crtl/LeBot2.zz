import { GatewayIntentBits } from 'discord.js';
import DsClient from '../dsClient';
import fs from 'fs';

describe('DsClient', () => {
	const dsClient: DsClient = new DsClient({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });

	beforeAll(() => {
		fs.mkdirSync(process.env.CMDS_FOLDER!, { recursive: true });
	});

	test('GetCommand get empty list', () => {
		expect(() => (dsClient as any).getCommandsList('dev')).toThrow('errors.init.noCmdsFound');
	});

	test('GetCommand get empty list', () => {
		expect(() => (dsClient as any).getCommandsList('prod')).toThrow('errors.init.noCmdsFound');
	});
});
