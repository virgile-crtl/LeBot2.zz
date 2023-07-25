require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates ] });
const cmdPath = path.join(__dirname, 'cmd');
const cmdFiles = fs.readdirSync(cmdPath).filter(file => file.endsWith('.js'));

client.commands = new Collection();

for (const file of cmdFiles) {
	const filePath = path.join(cmdPath, file);
	const cmd = require(filePath);

	if ('data' in cmd && 'execute' in cmd) {
		client.commands.set(cmd.data.name, cmd);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error('command not found: ${interaction.commandName}');
		return;
	}

	if (interaction.isAutocomplete()) {
		try {
			await command.autocomplete(interaction);
		} catch (error) {
			console.error(error);
		}
	} else {
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
		console.log(`[INFO] ${interaction.user.tag} used the ${interaction.commandName} command in ${interaction.guild.name}`);
	}
});

client.on("error", console.error);

client.on("warn", console.warn);

client.login(process.env.BOT_TOKEN);