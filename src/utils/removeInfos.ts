export default function removeInfos(guildId) {
	i = Stack.findIndex(x => x.id === guildId);
	if (i !== -1) {
		Stack.splice(i, 1);
	}
}