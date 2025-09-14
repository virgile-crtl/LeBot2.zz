import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { dbClient } from '../index';
import ClientError from '../clientError';
import GuildVoice from '../guildVoice';

export default function createGuildPlayer(trackName: string,
	interaction: ChatInputCommandInteraction<'cached'>) {
	if (!interaction.member || !(interaction.member instanceof GuildMember)
		|| !interaction.member.voice.channelId) {
		throw new ClientError('you need to be in a voice channel to play song.');
	}
	const shuf = interaction.options.getBoolean('shuffle') ?? true;
	const guildVoice = new GuildVoice(interaction.guildId, shuf,
	  interaction.channelId, interaction.client, {
	    channelId: interaction.member.voice.channelId,
	    guildId: interaction.guildId,
	    adapterCreator: interaction.guild.voiceAdapterCreator });
	guildVoice.play(trackName);
	dbClient.saveGuildVoice(interaction.guildId, guildVoice);
}