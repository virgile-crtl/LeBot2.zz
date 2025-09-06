import { AutocompleteInteraction, ChatInputCommandInteraction, GuildMember, SlashCommandBuilder, VoiceChannel } from 'discord.js';
import manageConnection from '../utils/manageConnection.ts';
import VoiceClient from '../voiceClient';
import path from 'path';
import fs from 'fs';
import { getVoiceConnection } from '@discordjs/voice';
import GuildsSongStack from '../guildsSongInfos.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song in the voice channel you are in.')
		.addStringOption(option =>
			option
				.setName('song')
				.setDescription('The song you want to play.')
				.setRequired(true)
				.setAutocomplete(true),
		)
		.addBooleanOption(option =>
			option
				.setName('shuffle')
				.setDescription('Whether or not you want to play a random song.')
				.setRequired(false),
		),

	async autocomplete(interaction: AutocompleteInteraction) {
		if (!interaction.guildId) return;
		const Path = path.join(__dirname, '../../song/', interaction.guildId);
		if (!fs.existsSync(Path)) {
			return interaction.respond([{ name: 'there are no songs in this server.', value: 'there are no songs in this server.' }]);
		}
		const focusedValue = interaction.options.getFocused();
		const choices = fs.readdirSync(Path).filter(file => file.endsWith('.mp3'));
		const noend = choices.map(choice => choice.substring(0, choice.length - 4));
		const filtered = noend.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase()));
		if (filtered.length > 25) {
			return;
		}
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},

	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.member || !(interaction.member instanceof GuildMember)  || !interaction.member.voice.channelId)
			return interaction.reply('you need to be in a voice channel to use this command.');
		if (!interaction.guildId || !interaction.guild)
			return interaction.reply('this command can only be used in a server.');
		const Path = path.join(__dirname, '../../song/', interaction.guildId);
		if (!fs.existsSync(Path))
			return interaction.reply('there are no songs in this server.');
		if (!fs.existsSync(path.join(Path, interaction.options.getString('song') + '.mp3')))
			return interaction.reply(interaction.options.getString('song') + ' does not exist.');

		let shuf: boolean;
		if (interaction.options.getBoolean('shuffle'))
			shuf = interaction.options.getBoolean('shuffle')!;
		else
			shuf = true;
		const guildsInfos = GuildsSongStack.getInstance();

		if (!getVoiceConnection(interaction.guildId)) {
			const voiceClient: VoiceClient = new VoiceClient({ channelId: interaction.member.voice.channelId,
				guildId: interaction.guildId, adapterCreator: interaction.guild.voiceAdapterCreator },
				path.join(Path, interaction.options.getString('song') + '.mp3'));
			guildsInfos.createGuildInfos(interaction.guildId, shuf);
			return interaction.reply("I am playing " + interaction.options.getString('song'));
		} else {
			guildsInfos.addSongToQueue(interaction.guildId, interaction.options.getString('song')!);
			if (interaction.options.getBoolean('shuffle'))
				guildsInfos.updateShuffle(interaction.guildId, interaction.options.getBoolean('shuffle')!);
			return interaction.reply(`I added "${interaction.options.getString('song')}" to the queue.`);
		}
	},
};