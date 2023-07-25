require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const rest = new REST().setToken(process.env.BOT_TOKEN);
const cmds  = [];

const cmdsPath = path.join(__dirname, '../src/cmd');
const cmdFiles = fs.readdirSync(cmdsPath).filter(file => file.endsWith('.js'));

for (const file of cmdFiles) {
	const command = require(cmdsPath + '/' + file);
	cmds.push(command.data.toJSON());
}

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.SERVER_ID), { body: [] })
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);