import "dotenv/config"
import { Client, ClientOptions, Collection } from 'discord.js';
import { Command } from './types/command';
import fs from 'fs';
import path from 'path';
import ClientError from "./clientError";

export default class DsClient extends Client {
  commands: Collection<string, Command>;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection<string, Command>();
  }

  async init() {
    const cmdFiles: string[] = fs.readdirSync(process.env.CMD_FOLDER!).filter(file => file.endsWith('.ts'));
    for (const file of cmdFiles) {
      const filePath = path.join(process.env.CMD_FOLDER!, file)
      const cmdModule = await import(filePath);
      const cmd: Command = cmdModule.default || cmdModule;
      if (!('data' in cmd) || !('execute' in cmd))
        throw new ClientError(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      this.commands.set(cmd.data.name, cmd);
    }
  }
}