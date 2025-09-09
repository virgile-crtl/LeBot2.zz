import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';

// Vérification des variables d'environnement
const BOT_TOKEN = process.env.BOT_TOKEN!;
const CLIENT_ID = process.env.CLIENT_ID!;
const GUILD_ID = process.env.GUILD_ID!;
const CMD_FOLDER = process.env.CMD_FOLDER!;

if (!BOT_TOKEN || !CLIENT_ID || !GUILD_ID || !CMD_FOLDER) {
    console.error("❌ Une ou plusieurs variables d'environnement sont manquantes !");
    process.exit(1);
}

const cmds: any[] = [];

async function loadCommands() {
    const folderPath = path.resolve(CMD_FOLDER);
    if (!fs.existsSync(folderPath)) {
        console.error(`❌ Le dossier des commandes n'existe pas : ${folderPath}`);
        process.exit(1);
    }

    const cmdFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of cmdFiles) {
        try {
            const commandModule = await import(path.join(folderPath, file));
            const command = commandModule.default;

            if (command?.data?.toJSON) {
                cmds.push(command.data.toJSON());
                console.log(`✅ Commande chargée : ${command.data.name}`);
            } else {
                console.warn(`⚠️ Commande invalide dans ${file}, 'data' manquant.`);
            }
        } catch (err) {
            console.error(`❌ Erreur lors du chargement de ${file}:`, err);
        }
    }
}

async function deployCommands() {
    await loadCommands();

    const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

    try {
        console.log(`🚀 Déploiement de ${cmds.length} commande(s) sur le serveur...`);

        const data: any = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: cmds },
        );

        console.log(`✅ Déploiement réussi : ${data.length} commande(s) enregistrée(s).`);
    } catch (error) {
        console.error("❌ Erreur lors du déploiement :", error);
    }
}

// Exécution
deployCommands();
