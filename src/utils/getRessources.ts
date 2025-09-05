import fs from 'fs';

export default function getRessources(Path, guildId) {
	if (Stack.find(x => x.id === guildId).list.length === 0 && Stack.find(x => x.id === guildId).rand) {
		const choices = fs.readdirSync(Path).filter(file => file.endsWith('.mp3'));
		const noend = choices.map(choice => choice.substring(0, choice.length - 4));
		const random = Math.floor(Math.random() * noend.length);
		return noend[random];
	}
	else {
		return Stack.find(x => x.id === guildId).list.shift();
	}
}