import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import ClientError from './clientError';
import GuildPlayer from './guildPlayer';
import DsClient from './dsClient';
import { t } from './i18next';

export default class PlayerService {
	private static _instance: PlayerService;
	private _guildsPlayers: Map<string, GuildPlayer>;

	constructor() {
		this._guildsPlayers = new Map();
	}

	public static getInstance(): PlayerService {
	  if (!PlayerService._instance) {
	    PlayerService._instance = new PlayerService();
	  }
		return PlayerService._instance;
	}

	public createGuildPlayer(track_name: string,
		interaction: ChatInputCommandInteraction<'cached'>): void {
		if (!interaction.member || !(interaction.member instanceof GuildMember)
			|| !interaction.member.voice.channelId) {
			throw new ClientError(t('needVoiceChannel'));
		}
		if (!interaction.channel || !interaction.channel.isTextBased()) {
			throw new ClientError(t('commandInTextChannel'));
		}
		const is_rand = interaction.options.getBoolean('rand') ?? true;
		const guildPlayer = new GuildPlayer(interaction.guildId, is_rand,
		  interaction.channelId, (interaction.client as DsClient), {
		    channelId: interaction.member.voice.channelId,
		    guildId: interaction.guildId,
		    adapterCreator: interaction.guild.voiceAdapterCreator });
		guildPlayer.play(track_name);
		this.saveGuildPlayer(interaction.guildId, guildPlayer);
	}

	public updatePlayer(track_name: string,
		interaction: ChatInputCommandInteraction<'cached'>): void {
		const guildPlayer = this.getGuildPlayer(interaction.guildId);
		guildPlayer.addToStack(track_name);
		guildPlayer.updateChannelId(interaction.channelId, interaction.channel);
		const is_rand = interaction.options.getBoolean('rand');
		if (is_rand != null) guildPlayer.setRandom(is_rand);
	}

	public saveGuildPlayer(guild_id: string, guildPlayer: GuildPlayer): void {
		if (this._guildsPlayers.has(guild_id)) { this.deleteGuildPlayer(guild_id); }
		this._guildsPlayers.set(guild_id, guildPlayer);
	}

	public getGuildPlayer(guild_id: string): GuildPlayer {
		if (!this._guildsPlayers.has(guild_id)) {
			throw new ClientError(t('noMusicSession'));
		}
		return this._guildsPlayers.get(guild_id)!;
	}

	public deleteGuildPlayer(guild_id: string): void {
		this._guildsPlayers.delete(guild_id);
	}
}