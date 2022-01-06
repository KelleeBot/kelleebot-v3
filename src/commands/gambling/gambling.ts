import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { daily } from ".";

export default class Gambling extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "gambling",
            category: "Gambling",
            description: "Gamble away all your points.",
            subcommands: {
                daily: {
                    description: `Claim your daily reward.`,
                    execute: async ({ client, interaction }) => {
                        await daily(client, interaction)
                    }
                }
            }
        })
    }
}