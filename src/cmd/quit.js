const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const { Stack } = require('../global.js');
const { removeInfos } = require('../utils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quit')
        .setDescription('Quits the voice channel you are in.'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guildId);
        if (!connection) {
            return interaction.reply('I am not in this server.');
        }
        removeInfos(interaction.guildId);
        connection.destroy();
        await interaction.reply('I quit the voice channel.');
    }
};