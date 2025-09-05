import 'dotenv/config'
import { Events, GatewayIntentBits } from 'discord.js';
import  DsClient  from './dsClient.js';
import { Command } from './types/command.js';


const client: DsClient = new DsClient({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });

client.once(Events.ClientReady, async c => {
	await client.init();
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

	const command = (interaction.client as DsClient).commands.get(interaction.commandName);
	if (!command) return console.error('command not found: ${interaction.commandName}');


	if (interaction.isChatInputCommand()) {
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			}
			else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	} else if (interaction.isAutocomplete()) {
		try {
			if (!command.autocomplete) throw new Error('The command ${interaction.commandName} does not support autocomplete.');
			await command.autocomplete(interaction);
		} catch (error) {
			console.error(error);
		}
	}

	if (interaction.guild) console.log(`[INFO] ${interaction.user.tag} used the ${interaction.commandName} command in ${interaction.guild.name}`);
	else console.log(`[INFO] ${interaction.user.tag} used the ${interaction.commandName} command in a DM`);
});

client.on('error', console.error);

client.on('warn', console.warn);

client.login(process.env.BOT_TOKEN);