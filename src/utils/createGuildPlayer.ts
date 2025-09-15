import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { dbClient } from '../index';
import ClientError from '../clientError';
import GuildPlayer from '../guildPlayer';
import DsClient from '../dsClient';

export default function createGuildPlayer(track_name: string,
	interaction: ChatInputCommandInteraction<'cached'>): void {
	if (!interaction.member || !(interaction.member instanceof GuildMember)
		|| !interaction.member.voice.channelId) {
		throw new ClientError('you need to be in a voice channel to play song.');
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