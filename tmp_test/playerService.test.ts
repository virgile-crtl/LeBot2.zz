import { CreateVoiceConnectionOptions, JoinVoiceChannelOptions } from '@discordjs/voice';
import DsClient from '../src/dsClient';
import GuildPlayer from '../src/guildPlayer';
import PlayerService from '../src/playerService';

jest.mock('../utils/createShuffleStack', () => jest.fn(() => ['track2', 'track1', 'track3']));

describe('DbClient', () => {
	const playerService = PlayerService.getInstance();

	beforeEach(() => {
		jest.clearAllMocks();

		(playerService as any)._guildsPlayers = new Map();
	});

	test('Create instance', () => {
		expect(PlayerService.getInstance()).toBeInstanceOf(PlayerService);
	});

	test('Get singleton instance', () => {
		expect(PlayerService.getInstance()).toBe(PlayerService.getInstance());
	});

	test('SaveGuildPlayer method without already exist', () => {
		const spySet = jest.spyOn((playerService as any)._guildsPlayers, 'set');
		const spyDelete = jest.spyOn(playerService, 'deleteGuildPlayer');
		const spyHas = jest.spyOn((playerService as any)._guildsPlayers, 'has');
		const guild_id = 'guild1';
		const player: GuildPlayer = await GuildPlayer.create(guild_id, true, 'channel1',
			{} as DsClient, {} as CreateVoiceConnectionOptions & JoinVoiceChannelOptions);

		playerService.saveGuildPlayer(guild_id, player);
		expect(spyHas).toHaveBeenCalledTimes(1);
		expect(spyHas).toHaveBeenCalledWith(guild_id);
		expect(spyDelete).not.toHaveBeenCalled();
		expect(spySet).toHaveBeenCalledTimes(1);
		expect(spySet).toHaveBeenCalledWith(guild_id, player);
	});

	test('SaveGuildPlayer method with already exist', () => {
		const spySet = jest.spyOn((playerService as any)._guildsPlayers, 'set');
		const spyDelete = jest.spyOn(playerService, 'deleteGuildPlayer');
		const spyHas = jest.spyOn((playerService as any)._guildsPlayers, 'has');
		const guild_id = 'guild1';
		const player: GuildPlayer = await GuildPlayer.create(guild_id, true, 'channel1',
			{} as DsClient, {} as CreateVoiceConnectionOptions & JoinVoiceChannelOptions);

		playerService.saveGuildPlayer(guild_id, player);
		playerService.saveGuildPlayer(guild_id, player);
		expect(spyHas).toHaveBeenCalledTimes(2);
		expect(spyHas).toHaveBeenCalledWith(guild_id);
		expect(spyDelete).toHaveBeenCalledTimes(1);
		expect(spyDelete).toHaveBeenCalledWith(guild_id);
		expect(spySet).toHaveBeenCalledTimes(2);
		expect(spySet).toHaveBeenCalledWith(guild_id, player);
	});

	test('UpdatePlayer method with rand not null', () => {
		const guild_id = 'guild1';
		const player: GuildPlayer = await GuildPlayer.create(guild_id, true, 'channel1',
			{} as DsClient, {} as CreateVoiceConnectionOptions & JoinVoiceChannelOptions);
		playerService.saveGuildPlayer(guild_id, player);
		const spyGetGuildPlayer = jest.spyOn(playerService, 'getGuildPlayer');
		const spyAddToStack = jest.spyOn(player, 'addToStack');
		const spyUpdateChannel = jest.spyOn(player, 'updateChannelId');
		const spySetRandom = jest.spyOn(player, 'setRandom');

		// playerService.saveGuildPlayer('guild2', await GuildPlayer.create('guild2', false, 'channel2',
		// {} as DsClient, {} as CreateVoiceConnectionOptions & JoinVoiceChannelOptions));

		playerService.updatePlayer('track2', guild_id, 'channel2', false);
		expect(spyGetGuildPlayer).toHaveBeenCalledTimes(1);
		expect(spyGetGuildPlayer).toHaveBeenCalledWith(guild_id);
		expect(spyAddToStack).toHaveBeenCalledTimes(1);
		expect(spyAddToStack).toHaveBeenCalledWith('track2');
		expect(spyUpdateChannel).toHaveBeenCalledTimes(1);
		expect(spyUpdateChannel).toHaveBeenCalledWith('channel2');
		expect(spySetRandom).toHaveBeenCalledTimes(1);
		expect(spySetRandom).toHaveBeenLastCalledWith(false);
	});

	test('UpdatePlayer method with rand not null', () => {
		const guild_id = 'guild1';
		const player: GuildPlayer = await GuildPlayer.create(guild_id, true, 'channel1',
			{} as DsClient, {} as CreateVoiceConnectionOptions & JoinVoiceChannelOptions);
		playerService.saveGuildPlayer(guild_id, player);
		const spyGetGuildPlayer = jest.spyOn(playerService, 'getGuildPlayer');
		const spyAddToStack = jest.spyOn(player, 'addToStack');
		const spyUpdateChannel = jest.spyOn(player, 'updateChannelId');
		const spySetRandom = jest.spyOn(player, 'setRandom');

		// playerService.saveGuildPlayer('guild2', await GuildPlayer.create('guild2', false, 'channel2',
		// {} as DsClient, {} as CreateVoiceConnectionOptions & JoinVoiceChannelOptions));

		playerService.updatePlayer('track2', guild_id, 'channel2', null);
		expect(spyGetGuildPlayer).toHaveBeenCalledTimes(1);
		expect(spyGetGuildPlayer).toHaveBeenCalledWith(guild_id);
		expect(spyAddToStack).toHaveBeenCalledTimes(1);
		expect(spyAddToStack).toHaveBeenCalledWith('track2');
		expect(spyUpdateChannel).toHaveBeenCalledTimes(1);
		expect(spyUpdateChannel).toHaveBeenCalledWith('channel2');
		expect(spySetRandom).not.toHaveBeenCalled();
	});

	test('GetGuildPlayer method with existing guild', () => {
		const spyGet = jest.spyOn((playerService as any)._guildsPlayers, 'get');
		const guild_id = 'guild1';
		const player = await GuildPlayer.create(guild_id, false, 'channel2',
			{} as DsClient, {} as CreateVoiceConnectionOptions & JoinVoiceChannelOptions);
		playerService.saveGuildPlayer(guild_id, player);
		playerService.saveGuildPlayer('guild2', await GuildPlayer.create('guild2', false, 'channel2',
			{} as DsClient, {} as CreateVoiceConnectionOptions & JoinVoiceChannelOptions));
		const spyHas = jest.spyOn((playerService as any)._guildsPlayers, 'has');

		expect(playerService.getGuildPlayer(guild_id)).toBe(player);
		expect(spyHas).toHaveBeenCalledTimes(1);
		expect(spyHas).toHaveBeenCalledWith(guild_id);
		expect(spyGet).toHaveBeenCalledTimes(1);
		expect(spyGet).toHaveBeenCalledWith(guild_id);
	});

	test('GetGuildPlayer method with existing guild', () => {
		const spyGet = jest.spyOn((playerService as any)._guildsPlayers, 'get');
		const guild_id = 'guild1';
		const spyHas = jest.spyOn((playerService as any)._guildsPlayers, 'has');

		expect(() => playerService.getGuildPlayer(guild_id)).toThrow('errors.music.noMusicSession');
		expect(spyHas).toHaveBeenCalledTimes(1);
		expect(spyHas).toHaveBeenCalledWith(guild_id);
		expect(spyGet).toHaveBeenCalledTimes(0);
	});

	test('GetGuildPlayer method with existing guild', async () => {
		const guild_id = 'guild1';
		const player = await GuildPlayer.create(guild_id, true, 'channel1',
			{} as DsClient, {} as CreateVoiceConnectionOptions & JoinVoiceChannelOptions);
		playerService.saveGuildPlayer(guild_id, player);
		playerService.saveGuildPlayer('guild2', await GuildPlayer.create('guild2', false, 'channel1',
			{} as DsClient, {} as CreateVoiceConnectionOptions & JoinVoiceChannelOptions));
		const spyDelete = jest.spyOn((playerService as any)._guildsPlayers, 'delete');

		playerService.deleteGuildPlayer('guild2');
		expect(Object.fromEntries((playerService as any)._guildsPlayers)).toEqual({ [guild_id]: player });
		expect(spyDelete).toHaveBeenCalledTimes(1);
		expect(spyDelete).toHaveBeenCalledWith('guild2');
	});
});
