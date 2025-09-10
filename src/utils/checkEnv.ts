import fs from 'fs'
import path from 'path';

export default function checkEnv(envVars: { name: string; mustBeFolder?: boolean }[]) {
  envVars.forEach(({ name, mustBeFolder }) => {
    const value = process.env[name];
    if (!value) {
      console.error('La variable d\'environnement ' + name + ' n\'est pas définie');
      process.exit(1)
    } else if (mustBeFolder && !fs.statSync(path.resolve(value)).isDirectory()) {
      console.error('Le dossier spécifié par ' + name + ' n\'existe pas ou n\'est pas un dossier : ' + path.resolve(value));
      process.exit(1)
    }
  });
}