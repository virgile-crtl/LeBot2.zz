import "dotenv/config"
import { Client, ClientOptions, Collection } from 'discord.js';
import { Command } from './types/command.js';
import fs from 'fs';
import path from 'path';

export default class DsClient extends Client {
  commands: Collection<string, Command>;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection<string, Command>();
  }

  async init() {
    const cmdsPath = path.join(process.env.CMD_FOLDER!);
    const cmdFiles: string[] = fs.readdirSync(cmdsPath).filter(file => file.endsWith('.ts'));
    for (const file of cmdFiles) {
      const filePath: string = path.join(cmdsPath, file);
      const cmdModule = await import(filePath);
      const cmd: Command = cmdModule.default || cmdModule;
      if ('data' in cmd && 'execute' in cmd) {
        this.commands.set(cmd.data.name, cmd);
      }
      else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }
}