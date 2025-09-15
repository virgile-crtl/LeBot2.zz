import { ChatInputCommandInteraction } from 'discord.js';
import { dbClient } from '../index';

export default function addToQueue(track_name: string,
	interaction: ChatInputCommandInteraction<'cached'>): void {
	const guildPlayer = dbClient.getGuildPlayer(interaction.guildId);
	guildPlayer.addToStack(track_name);
	const is_rand = interaction.options.getBoolean('rand');
	if (is_rand != null) guildPlayer.setRandom(is_rand);
}