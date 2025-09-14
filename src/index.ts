import dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.prod' });
import { Events, GatewayIntentBits } from 'discord.js';
import checkEnv from './utils/checkEnv';
import ClientError from './clientError';
import DbClient from './dbClient';
import DsClient from './dsClient';

checkEnv();

const client: DsClient = new DsClient({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });
export const dbClient: DbClient = new DbClient();

client.once(Events.ClientReady, async c => {
	try {
		await client.init();
		console.info('Ready! Logged in as ' + c.user.tag);
	}
	catch (err) {
		console.error(err);
		process.exit(1);
	}
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;
	const command = (interaction.client as DsClient).commands.get(interaction.commandName);
	if (!command) {
		throw new ClientError('command not found: ' + interaction.commandName);
	}
	if (!interaction.guildId) {
		throw new ClientError('This command can only be used in a server.');
	}

	if (interaction.isChatInputCommand()) {
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
			throw err;
		}
	}
	else {
		if (!command.autocomplete) throw new ClientError('The command ' + interaction.commandName + ' does not support autocomplete.');
		try {
			await command.autocomplete(interaction);
		}
		catch (err) {
			if (err instanceof ClientError) {
				interaction.respond([{ name: err.message.split(/[\n]/)[0], value: err.message.split(/[\n]/)[0] }]);
			}
		}
	}
});

client.on('error', console.error);

client.on('warn', console.warn);

client.login(process.env.BOT_TOKEN);