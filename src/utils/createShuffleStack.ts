import getAllTracksFromGuildFolder from './getAllTracksFromGuildFolder';

export default function createShuffleStack(guild_id: string): string[] {
	const tracks_list = getAllTracksFromGuildFolder(guild_id);

	for (let i = tracks_list.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[tracks_list[i], tracks_list[j]] = [tracks_list[j], tracks_list[i]];
	}
	return tracks_list;
}