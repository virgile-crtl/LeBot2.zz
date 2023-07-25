const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chat')
        .setDescription('create a chat room')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Create chat room for this user')
                .setRequired(false)
        ),
    async execute(interaction) {
        const user = interaction.options.getMember('user')
        if (user !== null) {
            const channel = await interaction.guild.channels.create({ name: user.user.username, type: ChannelType.GuildVoice });
            await user.voice.setChannel(channel.id);
        } else {
            const channel = await interaction.guild.channels.create({ name: interaction.user.username, type: ChannelType.GuildVoice });
            const member = await interaction.guild.members.fetch(interaction.user.id);
            await member.voice.setChannel(channel.id);
        }
        await interaction.reply('chat room created!');
    },
}