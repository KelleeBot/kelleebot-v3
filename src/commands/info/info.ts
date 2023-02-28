import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { role, guild, user } from "../../subcommandHelpers/info";

export default class Info extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "info",
            category: "Info",
            description: "Information/Stat commands.",
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            subcommands: {
                role: {
                    description: "Show information about a role.",
                    options: [
                        {
                            name: "role",
                            description: "The role to see information about.",
                            type: Constants.ApplicationCommandOptionTypes.ROLE,
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await role(client, interaction);
                    }
                },
                server: {
                    description: "Show information about the server.",
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await guild(client, interaction);
                    }
                },
                user: {
                    description: "Show information about yourself or another user.",
                    options: [
                        {
                            name: "user",
                            description: "The other user to see information about.",
                            type: Constants.ApplicationCommandOptionTypes.USER
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await user(client, interaction);
                    }
                }
            }
        });
    }
}
