require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const SoundCloudAudio = require('soundcloud-audio');

const player = new SoundCloudAudio('95f22ed54a5c297b1c41f72d713623ef');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sound')
        .setDescription('Plays a music with soundcloud')
        .addStringOption(option =>
            option
                .setName('song')
                .setDescription('The song you want to play.')
                .setRequired(true),
        ),
    async execute(interaction) {
        if (!interaction.member.voice.channelId) {
            return interaction.reply('you need to be in a voice channel to use this command.');
        }
        // connection = getVoiceConnection(interaction.guildId);
        // if (!connection) {
        //     connection = joinVoiceChannel({
        //         channelId: interaction.member.voice.channelId,
        //         guildId: interaction.guildId,
        //         adapterCreator: interaction.guild.voiceAdapterCreator,
        //     });
        //     const player = createAudioPlayer();
        //     const resource = createAudioResource(path.join(Path, interaction.options.getString('song') + '.mp3'));
        //     player.play(resource);
        //     connection.subscribe(player);
        // }
        await interaction.reply('I am playing the song.');
    }
};