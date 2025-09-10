import dotenv from "dotenv";
dotenv.config({ path: process.env.NODE_ENV === "dev" ? ".env.dev" : ".env.prod"});
import { AutocompleteInteraction, ChatInputCommandInteraction, Client, Events, GatewayIntentBits, Interaction, SharedSlashCommand } from 'discord.js';
import DbClient from './dbClient';
import DsClient  from './dsClient';
import ClientError from "./clientError";
import checkEnv from "./utils/checkEnv";

checkEnv([
  { name: "BOT_TOKEN" },
  { name: "CLIENT_ID" },
  { name: "GUILD_ID" },
  { name: "CMD_FOLDER", mustBeFolder: true },
  { name: "SONG_FOLDER", mustBeFolder: true },
]);
export const dbClient: DbClient = new DbClient();
const client: DsClient = new DsClient({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });

client.once(Events.ClientReady, async c => {
	try {
		await client.init();
	} catch (err) {
		console.error(err);
		process.exit(1)
	}
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;
	try {
		const command = (interaction.client as DsClient).commands.get(interaction.commandName);
		if (!command)
			throw new ClientError('command not found: ' + interaction.commandName);
		if (!interaction.guildId)
			throw new ClientError('This command can only be used in a server.')

		if (interaction.isChatInputCommand()) {
			await command.execute(interaction);
		} else {
			if (!command.autocomplete) throw new ClientError('The command ' + interaction.commandName + ' does not support autocomplete.');
			await command.autocomplete(interaction);
			console.info(interaction.user.tag + 'used the ' + interaction.commandName + ' command in ' + interaction.guild!.name);
		}
	} catch (err) {
		manageRespond(interaction, err);
	}
});

client.on('error', console.error);

client.on('warn', console.warn);

client.login(process.env.BOT_TOKEN);

async function manageRespond(interaction: ChatInputCommandInteraction | AutocompleteInteraction, err: unknown) {
	if (err instanceof ClientError) {
			if (interaction.isChatInputCommand())
				if (interaction.replied || interaction.deferred)
					await interaction.followUp(err.message);
				else
					await interaction.reply(err.message);
			else
				interaction.respond([{ name: err.message, value: err.message }]);
		} else {
			console.error(err)
			if (interaction.isChatInputCommand())
				if (interaction.replied || interaction.deferred)
					await interaction.followUp('There was an error while executing this command!');
				else
					await interaction.reply('There was an error while executing this command!');
			else
				interaction.respond([{
					name: 'The command ' + interaction.commandName + ' does not support autocomplete.',
					value: 'The command ' + interaction.commandName + ' does not support autocomplete.'}]);
		}
}