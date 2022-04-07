import { CommandInteraction } from "discord.js";
import { Command, CommandOptions } from "../prefab/command";
import { Client } from "./client";

class KelleeBotCommand extends Command {
    constructor(client: Client, options: CommandOptions) {
        super(client, options);
    }

    // async additionalChecks(interaction: CommandInteraction) {
    //   return true;
    // }
}

export { KelleeBotCommand };
