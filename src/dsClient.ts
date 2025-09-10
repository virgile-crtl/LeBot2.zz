import { Client, ClientOptions, Collection, REST, Routes } from 'discord.js';
import { Command } from './types/command';
import ClientError from "./clientError";
import fs from 'fs';
import path from 'path';
import readline from "readline";

export default class DsClient extends Client {
  commands: Collection<string, Command>;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection<string, Command>();

  }

  async init(){
    const env = process.env.NODE_ENV || "dev";
    const cmds: Command[] = await this.loadCommands(env);
    for (const cmd of cmds) {
      if (!('data' in cmd) || !('execute' in cmd))
        throw new ClientError(' command missing a required \'data" or \'execute\' property.');
      this.commands.set(cmd.data.name, cmd);
      console.info('Command ' + cmd.data.name + ' is loaded');
    }
    await this.deployCommands(cmds);
  }

  private async loadCommands (env: string): Promise<Command[]> {
    const cmds: Command[] = [];
    const cmdFiles: string[] = fs.readdirSync(process.env.CMD_FOLDER!)
      .filter(file => file.endsWith(env === "dev" ? ".ts" : ".js"));

    if (cmdFiles.length <= 0)
      throw new ClientError('None command found');

    for (const file of cmdFiles) {
      const cmdModule = await import(path.join(process.env.CMD_FOLDER!, file));
      const cmd: Command = cmdModule.default || cmdModule;
      cmds.push(cmd);
    }
    return cmds;
  }

  private async deployCommands(cmds: Command[]) {
    try {
      const env = process.env.NODE_ENV || "dev";
      const deploy: boolean = env === "dev" ? await this.askDeploy() : true;
      const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);
      if (deploy) {
        if (env === "dev") {
          await rest.put(Routes.applicationGuildCommands
            (process.env.CLIENT_ID!, process.env.GUILD_ID!), { body: [] })
          console.info('Successful remove Commands');
          await rest.put(Routes.applicationGuildCommands
            (process.env.CLIENT_ID!, process.env.GUILD_ID!),
            { body: cmds.map(cmd => cmd.data.toJSON()) });
        } else {
          await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: [] })
          console.info('Successful remove Commands');
          await rest.put(Routes.applicationCommands
            (process.env.CLIENT_ID!), { body: cmds.map(cmd => cmd.data.toJSON()) });
        }
        console.info('Successful deployment: ' + cmds.length + ' recorded commands.');
      }
    } catch (err) {
      console.error(err)
      throw new ClientError('Error during deployment');
    }
  }

  private async askDeploy(): Promise<boolean> {
    const rl = readline.createInterface({
      input: process.stdin, output: process.stdout,});

    return new Promise((resolve) => {
      rl.question("Do you want to deploy the orders? (y/n): ", (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase()[0] === "y");
      });
    });
  }
}