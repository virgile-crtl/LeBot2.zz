import { config } from 'dotenv';
config({ path: '.env.dev' });

import { REST, Routes } from 'discord.js';



if (!process.env.BOT_TOKEN || !process.env.CLIENT_ID) {
  throw new Error('TOKEN ou CLIENT_ID manquant dans .env.dev');
}

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('🔄 Suppression des commandes globales...');
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: [] });
    console.log('✅ Commandes globales supprimées.');

    if (process.env.GUILD_ID) {
      console.log('🔄 Suppression des commandes du serveur...');
      await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID), { body: [] });
      console.log('✅ Commandes du serveur supprimées.');
    }

    console.log('🎉 Terminé !');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des commandes :', error);
  }
})();