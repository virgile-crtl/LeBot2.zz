import dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.prod' });
import { Command } from './types/command';
import { Events, GatewayIntentBits } from 'discord.js';
import { initI18n } from './i18next';
import { i18n } from 'i18next';
import checkEnv from './utils/checkEnv';
import ClientError from './clientError';
import DbClient from './dbClient';
import DsClient from './dsClient';

checkEnv();

const dsClient: DsClient = new DsClient({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });
export const dbClient: DbClient = new DbClient();
export let langClient: i18n;

dsClient.once(Events.ClientReady, async client => {
	try {
		langClient = await initI18n('fr');
		if (!langClient) { throw Error('Unable to load languages'); };
		await dsClient.init();
		console.info(langClient.t('logged', { name: client.user.tag }));
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
		console.info(langClient.t('usedCmd', { tag: interaction.user.tag,
			commandName: interaction.commandName, name: interaction.guild!.name }));
	}
	catch (err) {
		if (err instanceof ClientError) {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(err.message.split(/[\n]/)[0]);
			}
			else { await interaction.reply(err.message.split(/[\n]/)[0]); }
		}
		else if (interaction.replied || interaction.deferred) {
			await interaction.followUp(langClient.t('uknError'));
		}
		else { await interaction.reply(langClient.t('uknError')); }
		throw err;
	}
});

dsClient.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isAutocomplete()) return;
	const command: Command = dsClient.getCommand(interaction.commandName);

	if (!command.autocomplete) throw new ClientError(langClient.t('noAutocomplete', { commandName: interaction.commandName }));
	try {
		await command.autocomplete(interaction);
	}
	catch (err) {
		if (err instanceof ClientError) {
			interaction.respond([{ name: err.message.split(/[\n]/)[0], value: err.message.split(/[\n]/)[0] }]);
		}
		else {interaction.respond([{ name: langClient.t('uknError'), value: langClient.t('uknError') }]);}
		throw err;
	}
});

dsClient.on('error', console.error);

dsClient.on('warn', console.warn);

dsClient.login(process.env.BOT_TOKEN);
