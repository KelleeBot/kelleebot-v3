import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { daily, points } from ".";

export default class Gambling extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "gambling",
            category: "Gambling",
            description: "Gamble away all your points.",
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            subcommands: {
                daily: {
                    description: "Claim your daily reward.",
                    execute: async ({ client, interaction }) => {
                        await daily(client, interaction);
                    }
                },
                points: {
                    description: "Check how many points you or another user has and current ranking.",
                    args: [
                        {
                            name: "user",
                            description: "The user to check.",
                            type: "USER"
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await points(client, interaction);
                    }
                }
            }
        })
    }
}