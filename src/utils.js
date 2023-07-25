const fs = require('fs');
const { joinVoiceChannel, createAudioResource, getVoiceConnection, createAudioPlayer, AudioPlayerStatus } = require('@discordjs/voice');
const { Stack } = require('./global.js');
const path = require('path');
const { connect } = require('http2');

function getRessources(Path, guildId) {
    if (Stack.find(x => x.id === guildId).list.length === 0 && Stack.find(x => x.id === guildId).rand) {
        const choices = fs.readdirSync(Path).filter(file => file.endsWith('.mp3'));
        const noend = choices.map(choice => choice.substring(0, choice.length - 4));
        const random = Math.floor(Math.random() * noend.length);
        return noend[random];
    } else {
        return Stack.find(x => x.id === guildId).list.shift();
    }
}

function removeInfos(guildId) {
    i = Stack.findIndex(x => x.id === guildId);
    if (i !== -1) {
        Stack.splice(i, 1);
    }
}

function openConnection(interaction) {
    removeInfos(interaction.guildId);
    Stack.push({ rand: interaction.options.getBoolean('random'), list: [], id: interaction.guildId});
    return joinVoiceChannel({
        channelId: interaction.member.voice.channelId,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
    });
}

function playerIdle(interaction, connection, player, Path) {
    if (Stack.find(x => x.id === interaction.guildId).list.length === 0 && !Stack.find(x => x.id === interaction.guildId).rand) {
        removeInfos(Stack, interaction);
        connection.destroy();
        return;
    } else {
        const song = getRessources(Path, interaction.guildId);
        const resource = createAudioResource(path.join(Path, song + '.mp3'));
        player.play(resource);
    }
}

function manageConnection(interaction, Path, res)
{
    if (!getVoiceConnection(interaction.guildId)) {
        const connection = openConnection(interaction);
        const player = createAudioPlayer();
        const resource = createAudioResource(path.join(Path, res + '.mp3'));
        player.play(resource);
        connection.subscribe(player);
        player.on(AudioPlayerStatus.Idle, () => playerIdle(interaction, connection, player, Path));
        return interaction.reply(`I am playing "${res}"`);
    } else {
        Stack.find(x => x.id === interaction.guildId).list.push(res);
        return interaction.reply(`I added "${res}" to the queue.`);
    }
}

module.exports = { getRessources, removeInfos, openConnection, manageConnection };