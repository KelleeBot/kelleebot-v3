import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { guild, user } from "../../subcommandHelpers/info";

export default class Info extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "info",
            category: "Info",
            description: "Information/Stat commands.",
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            subcommands: {
                user: {
                    description: "Show information about yourself or another user.",
                    options: [
                        {
                            name: "user",
                            description: "The other user to see information about.",
                            type: "USER"
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await user(client, interaction);
                    }
                },
                server: {
                    description: "Show information about the server.",
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await guild(client, interaction);
                    }
                }
            }
        });
    }
}
