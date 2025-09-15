import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { dbClient, langClient } from '../index';
import ClientError from '../clientError';
import GuildPlayer from '../guildPlayer';
import DsClient from '../dsClient';

export default function createGuildPlayer(track_name: string,
	interaction: ChatInputCommandInteraction<'cached'>): void {
	if (!interaction.member || !(interaction.member instanceof GuildMember)
		|| !interaction.member.voice.channelId) {
		throw new ClientError(langClient.t('needVoiceChannel'));
	}
	if (!interaction.channel || !interaction.channel.isTextBased()) {
		throw new ClientError(langClient.t('commandInTextChannel'));
	}
	const is_rand = interaction.options.getBoolean('rand') ?? true;
	const guildPlayer = new GuildPlayer(interaction.guildId, is_rand,
	  interaction.channelId, (interaction.client as DsClient), {
	    channelId: interaction.member.voice.channelId,
	    guildId: interaction.guildId,
	    adapterCreator: interaction.guild.voiceAdapterCreator });
	guildPlayer.play(track_name);
	dbClient.saveGuildPlayer(interaction.guildId, guildPlayer);
}