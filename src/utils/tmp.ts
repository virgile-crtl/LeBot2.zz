import { AudioPlayer, getVoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction, GuildMember, InteractionReplyOptions, InteractionResponse, Message, MessagePayload } from 'discord.js';
import { dbClient } from '../index';
import ClientError from '../clientError';
import voiceClient from '../voiceClient';
import path from 'path';

export function putSongPlay(interaction: ChatInputCommandInteraction<'cached'>, songName: string, songFolder: string,
	reply: (options: string | InteractionReplyOptions | MessagePayload) => Promise<InteractionResponse | Message<boolean>>) {
	if (!interaction.channel || !interaction.channel.isTextBased()) {
	  throw new ClientError('you need to make the command in a Text channel to play song.');
	}

	if (!getVoiceConnection(interaction.guildId)) {
		create(interaction, path.join(songFolder, songName + '.mp3'));
		return reply('I am playing ' + songName);
	}
	else {
		add(interaction, songName);
		return reply('I added ' + songName + ' to the queue.');
	}
}

export function create(interaction: ChatInputCommandInteraction<'cached'>, songPath: string) {
	if (!interaction.member || !(interaction.member instanceof GuildMember) || !interaction.member.voice.channelId) {
		throw new ClientError('you need to be in a voice channel to play song.');
	}

	try { dbClient.getGuildVoice(interaction.guildId); }
	catch { dbClient.deleteGuildVoice(interaction.guildId); }
	const player: AudioPlayer = voiceClient.play(interaction.guildId, songPath, interaction.client,
		{
			channelId: interaction.member.voice.channelId,
			guildId: interaction.guildId,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});
	const shuf = interaction.options.getBoolean('shuffle') ?? true;
	dbClient.createGuildVoice(interaction.guildId, shuf, player, interaction.channelId);
}

export function add(interaction: ChatInputCommandInteraction<'cached'>, songName: string) {
	dbClient.addSongToQueue(interaction.guildId, songName);
	const shuf = interaction.options.getBoolean('shuffle');
	if (shuf != null) dbClient.updateShuffle(interaction.guildId, shuf);
}