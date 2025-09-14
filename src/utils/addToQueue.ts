import { ChatInputCommandInteraction } from 'discord.js';
import { dbClient } from '../index';

export default function addToQueue(trackName: string,
	interaction: ChatInputCommandInteraction<'cached'>) {
	const guildVoice = dbClient.getGuildVoice(interaction.guildId);
	guildVoice.addToStack(trackName);
	const shuf = interaction.options.getBoolean('shuffle');
	if (shuf != null) guildVoice.setRandom(shuf);
}