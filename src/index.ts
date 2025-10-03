import dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev' });

import { Command } from './types/command';
import { Events, GatewayIntentBits } from 'discord.js';
import checkEnv from './utils/checkEnv';
import ClientError from './clientError';
import DsClient from './dsClient';
import { initI18n, t } from './i18next';

checkEnv();
const dsClient: DsClient = new DsClient({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });

dsClient.once(Events.ClientReady, async client => {
	try {
		await initI18n();
		await dsClient.init();
		console.info(t('logged', { name: client.user.tag }));
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
		console.info(t('usedCmd', { tag: interaction.user.tag,
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
			await interaction.followUp(t('uknError'));
		}
		else { await interaction.reply(t('uknError')); }
		throw err;
	}
});

dsClient.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isAutocomplete()) return;
	const command: Command = dsClient.getCommand(interaction.commandName);

	if (!command.autocomplete) throw new ClientError(t('noAutocomplete', { commandName: interaction.commandName }));
	try {
		await command.autocomplete(interaction);
	}
	catch (err) {
		if (err instanceof ClientError) {
			interaction.respond([{ name: err.message.split(/[\n]/)[0], value: err.message.split(/[\n]/)[0] }]);
		}
		else {interaction.respond([{ name: t('uknError'), value: t('uknError') }]);}
		throw err;
	}
});

dsClient.on('error', console.error);

dsClient.on('warn', console.warn);

dsClient.login(process.env.BOT_TOKEN);
