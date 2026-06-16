import { ChatInputCommandInteraction, GuildMember, SlashCommandBuilder } from 'discord.js';
import downloadTrack from '../utils/downloads';
import fs from 'fs';
import path from 'path';
import putTrackInPlayer from '../utils/putTrackInPlayer';
import i18next from 'i18next';

export default {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Adds a track to the bot.')
		.addStringOption(option =>
			option
				.setName('url')
				.setDescription('The url of the track you want to add.')
				.setRequired(false),
		)
		.addAttachmentOption(option =>
  		option
				.setName('track')
      	.setDescription('Add your own track')
      	.setRequired(false),
		)
		.addBooleanOption(option =>
			option
				.setName('rand')
				.setDescription('Whether or not you want to play a random track after your queue.')
				.setRequired(false),
		)
		.addBooleanOption(option =>
			option
				.setName('to_queue')
				.setDescription('Whether or not you want to add the track to the queue.')
				.setRequired(false),
		),

	async execute(interaction: ChatInputCommandInteraction<'cached'>): Promise<void> {
		const guild_folder: string = path.join(process.env.MUSIC_FOLDER!, interaction.guildId);
		if (!fs.existsSync(guild_folder)) { fs.mkdirSync(guild_folder, { recursive: true }); }

		interaction.reply(i18next.t('music.startDownload'));
		const track_name = await downloadTrack(interaction.guildId, interaction.options.getString('url'),
			interaction.options.getAttachment('track'));
		interaction.editReply(i18next.t('music.downloadCompleted'));

		const to_queue = interaction.options.getBoolean('to_queue') ?? (interaction.member && (interaction.member instanceof GuildMember)
				&& interaction.member.voice.channelId) ? true : false;
		if (to_queue) {
			await putTrackInPlayer(interaction, guild_folder, track_name, interaction.followUp.bind(interaction));
		}
	},
};