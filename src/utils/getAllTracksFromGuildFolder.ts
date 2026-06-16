import { dbclient } from '../dbclient';
import ClientError from '../clientError';
import i18next from 'i18next';


export default async function getAllTracksFromGuildFolder(guild_id: string): Promise<string[]> {
	const tracks_list = (await dbclient.music.findMany({ where: { guilds: { some: { guildId: guild_id } } }, select: { title: true } })).map(track => track.title);

	if (!tracks_list || tracks_list.length <= 0) {
		throw new ClientError(i18next.t('errors.music.noTracksInServer'));
	}
	return tracks_list;
}
