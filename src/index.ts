import dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.prod' });
import { Command } from './types/command';
import { Events, GatewayIntentBits } from 'discord.js';
import checkEnv from './utils/checkEnv';
import ClientError from './clientError';
import DbClient from './dbClient';
import DsClient from './dsClient';

checkEnv();

const dsClient: DsClient = new DsClient({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });
export const dbClient: DbClient = new DbClient();

dsClient.once(Events.ClientReady, async c => {
	try {
		await dsClient.init();
		console.info('Ready! Logged in as ' + c.user.tag);
	}
	catch (err) {
		console.error(err);
		process.exit(1);
	}
});

dsClient.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command: Command = dsClient.getCommand(interaction.commandName);

	try {
		await command.execute(interaction);
		console.info(interaction.user.tag + ' used the ' + interaction.commandName + ' command in ' + interaction.guild!.name);
	}
	catch (err) {
		if (err instanceof ClientError) {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(err.message.split(/[\n]/)[0]);
			}
			else { await interaction.reply(err.message.split(/[\n]/)[0]); }
		}
		else if (interaction.replied || interaction.deferred) {
			await interaction.followUp('Unknow error');
		}
		else { await interaction.reply('Unknow error'); }
		throw err;
	}
});

dsClient.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isAutocomplete()) return;
	const command: Command = dsClient.getCommand(interaction.commandName);

	if (!command.autocomplete) throw new ClientError('The command ' + interaction.commandName + ' does not support autocomplete.');
	try {
		await command.autocomplete(interaction);
	}
	catch (err) {
		if (err instanceof ClientError) {
			interaction.respond([{ name: err.message.split(/[\n]/)[0], value: err.message.split(/[\n]/)[0] }]);
		}
		else {interaction.respond([{ name: 'Unknow Error', value: 'Unknow Error' }]);}
		throw err;
	}
});

dsClient.on('error', console.error);

dsClient.on('warn', console.warn);

dsClient.login(process.env.BOT_TOKEN);