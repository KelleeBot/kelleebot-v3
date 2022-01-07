import { Client } from "../../../util/client";
import { KelleeBotCommand } from "../../../util/command";
import { add, remove } from ".";

export default class Blacklist extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "blacklist",
            category: "Bot Owner",
            description: "Blacklists/whitelists users from using the bot.",
            devOnly: true,
            clientPerms: ["SEND_MESSAGES"],
            subcommands: {
                add: {
                    description: "Blacklist a user.",
                    args: [
                        {
                            name: "user",
                            description: "The user to add to the blacklist.",
                            type: "USER",
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await add(client, interaction);
                    }
                },
                remove: {
                    description: "Whitelist a user.",
                    args: [
                        {
                            name: "user",
                            description: "The user to remove from the blacklist.",
                            type: "USER",
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await remove(client, interaction);
                    }
                }
            }
        });
    }
}