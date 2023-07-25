const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection, createAudioResource } = require('@discordjs/voice');
const { getRessources, removeInfos } = require('../utils.js');
const { Stack } = require('../global.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('skips the current song.'),
    async execute(interaction) {
        const connection = getVoiceConnection(interaction.guildId);
        if (!connection) {
            return interaction.reply('I am not playing anything.');
        }
        const Path = path.join(__dirname, '../../song/' + interaction.guildId);
        if (Stack.find(x => x.id === interaction.guildId).list.length === 0 && !Stack.find(x => x.id === interaction.guildId).rand) {
            removeInfos(interaction.guildId);
            connection.destroy();
            return interaction.reply('I stopped playing because there are no more songs in the queue.');
        }
        const song = getRessources(Path, interaction.guildId);
        const resource = createAudioResource(path.join(Path, song + '.mp3'));
        connection.state.subscription.player.play(resource);
        await interaction.reply('I skipped the current song.');
    }
};