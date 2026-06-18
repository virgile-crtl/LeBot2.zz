import { getVoiceConnection } from '@discordjs/voice';
import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import type { Music } from '@prisma/client';
import ClientError from '../clientError';
import DsClient from '../dsClient';
import GuildPlayer from '../guildPlayer';
import i18next from 'i18next';
import PlayerService from '../playerService';

export default async function putTrackInPlayer(interaction: ChatInputCommandInteraction<'cached'>,
	track: Music, respond: (content: string) => Promise<any>): Promise<void> {
	if (!interaction.channel || !interaction.channel.isTextBased()) {
		throw new ClientError(i18next.t('errors.cmd.commandInTextChannel'));
	}
	if (!interaction.member || !(interaction.member instanceof GuildMember)
		|| !interaction.member.voice.channelId) {
		throw new ClientError(i18next.t('errors.music.needVoiceChannel'));
	}


	if (!getVoiceConnection(interaction.guildId)) {
		const guildPlayer = await GuildPlayer.create(interaction.guildId, interaction.options.getBoolean('rand') ?? true,
			interaction.channelId, (interaction.client as DsClient), {
				channelId: interaction.member.voice.channelId!,
				guildId: interaction.guildId,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			},
		);
		guildPlayer.play(track.path);
		PlayerService.getInstance().saveGuildPlayer(interaction.guildId, guildPlayer);
		await respond(i18next.t('music.play', { trackName: track.title }));
	}
	else {
		PlayerService.getInstance().updatePlayer(track.title, interaction.guildId,
			interaction.channelId, interaction.options.getBoolean('rand'));
		await respond(i18next.t('music.trackAdd', { trackName: track.title }));
	}
}