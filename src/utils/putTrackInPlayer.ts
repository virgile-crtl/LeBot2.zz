import { getVoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import ClientError from '../clientError';
import DsClient from '../dsClient';
import GuildPlayer from '../guildPlayer';
import i18next from 'i18next';
import PlayerService from '../playerService';
import path from 'path';

export default async function putTrackInPlayer(interaction: ChatInputCommandInteraction<'cached'>,
	guild_folder: string, track_name: string, respond: (content: string) => Promise<any>): Promise<void> {
	if (!interaction.channel || !interaction.channel.isTextBased()) {
		throw new ClientError(i18next.t('errors.cmd.commandInTextChannel'));
	}
	if (!interaction.member || !(interaction.member instanceof GuildMember)
		|| !interaction.member.voice.channelId) {
		throw new ClientError(i18next.t('errors.music.needVoiceChannel'));
	}


	if (!getVoiceConnection(interaction.guildId)) {
		const guildPlayer = new GuildPlayer(interaction.guildId, interaction.options.getBoolean('rand') ?? true,
			interaction.channelId, (interaction.client as DsClient), {
				channelId: interaction.member.voice.channelId!,
				guildId: interaction.guildId,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			},
		);
		guildPlayer.play(path.join(guild_folder, track_name + '.mp3'));
		PlayerService.getInstance().saveGuildPlayer(interaction.guildId, guildPlayer);
		await respond(i18next.t('music.play', { trackName: track_name }));
	}
	else {
		PlayerService.getInstance().updatePlayer(track_name, interaction.guildId,
			interaction.channelId, interaction.options.getBoolean('rand'));
		await respond(i18next.t('music.trackAdd', { trackName: track_name }));
	}
}