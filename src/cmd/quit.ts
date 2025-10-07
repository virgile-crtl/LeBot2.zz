import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { t } from '../i18n';
import PlayerService from '../playerService';


export default {
	data: new SlashCommandBuilder()
		.setName('quit')
		.setDescription('Quit the voice channel where I am'),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		const playerService: PlayerService = PlayerService.getInstance();
		playerService.getGuildPlayer(interaction.guildId).stop();
		playerService.deleteGuildPlayer(interaction.guildId);
		await interaction.reply(t('leavingChannel'));
	},
};