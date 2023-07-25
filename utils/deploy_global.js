require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const cmds  = [];

const cmdsPath = path.join(__dirname, '../src/cmd');
const cmdFiles = fs.readdirSync(cmdsPath).filter(file => file.endsWith('.js'));

for (const file of cmdFiles) {
	const command = require(cmdsPath + '/' + file);
	cmds.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
	try {
		console.log(`Started refreshing ${cmds.length} application (/) cmd.`);

		const data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: cmds },
		);

		console.log(`Successfully reloaded ${data.length} application (/) cmd.`);
	} catch (error) {
		console.error(error);
	}
})();