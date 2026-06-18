import checkEnv from './utils/checkEnv';
import { Command } from './types/command';
import { Events, GatewayIntentBits } from 'discord.js';
import { dbclient } from './dbclient';

import Backend from 'i18next-fs-backend';
import ClientError from './clientError';
import DsClient from './dsClient';
import i18next from 'i18next';
import path from 'path';

checkEnv();
const dsClient: DsClient = new DsClient({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });

dsClient.once(Events.ClientReady, async client => {
	try {
		await i18next.use(Backend)
			.init({
	  		lng: process.env.LANGUAGE!,
	  		fallbackLng: 'en',
	  		backend: {
	  	  	loadPath: path.join(process.env.TRANSLATION_FOLDER!, '{{lng}}/translation.json'),
	  		},
				interpolation: {
	  			escapeValue: false,
  			},
			});
		await dsClient.init();
		console.info(i18next.t('init.logged', { name: client.user.tag }));
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
		if (interaction.guildId === null) throw new ClientError(i18next.t('errors.cmd.commandInGuild'));
		await dbclient.guild.upsert({
  		where: { guildId: interaction.guildId },
  		update: {},
  		create: {
    		guildId: interaction.guildId,
  		},
		});

		await command.execute(interaction);
		console.info(i18next.t('usedCmd', { tag: interaction.user.tag,
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
			await interaction.followUp(i18next.t('errors.uknError'));
		}
		else { await interaction.reply(i18next.t('errors.uknError')); }
		throw err;
	}
});

dsClient.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isAutocomplete()) return;
	const command: Command = dsClient.getCommand(interaction.commandName);

	if (!command.autocomplete) throw new ClientError(i18next.t('errors.cmd.noAutocomplete', { commandName: interaction.commandName }));
	try {
		await command.autocomplete(interaction);
	}
	catch (err) {
		if (err instanceof ClientError) {
			interaction.respond([{ name: err.message.split(/[\n]/)[0], value: err.message.split(/[\n]/)[0] }]);
		}
		else {interaction.respond([{ name: i18next.t('errors.uknError'), value: i18next.t('errors.uknError') }]);}
		throw err;
	}
});

dsClient.on('error', console.error);

dsClient.on('warn', console.warn);

dsClient.login(process.env.BOT_TOKEN);
