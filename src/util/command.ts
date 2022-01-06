import { Command, CommandOptions } from "../prefab/command";
import { Client } from "./client";

class KelleeBotCommand extends Command {
  constructor(client: Client, options: CommandOptions) {
    super(client, options);
  }
}

export { KelleeBotCommand };
