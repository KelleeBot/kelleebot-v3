import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { blackjack, daily, gamble, points, slots } from "../../subcommandHelpers/gambling";

export default class Gambling extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "gambling",
            category: "Gambling",
            description: "Gamble away all your points.",
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            subcommands: {
                blackjack: {
                    description: "Play blackjack with the bot.",
                    args: [
                        {
                            name: "amount",
                            description: "The amount of points (or all) to gamble.",
                            type: "STRING",
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await blackjack(client, interaction);
                    }
                },
                daily: {
                    description: "Claim your daily reward.",
                    execute: async ({ client, interaction }) => {
                        await daily(client, interaction);
                    }
                },
                gamble: {
                    description: "Gamble your points.",
                    args: [
                        {
                            name: "amount",
                            description: "The amount of points (or all) to gamble.",
                            type: "STRING",
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await gamble(client, interaction);
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
                },
                slots: {
                    description: "Test your luck and play the slots. Each slot win gives you 4 times the amount you bet.",
                    args: [
                        {
                            name: "points",
                            description: "The amount of points (or all) to gamble.",
                            type: "STRING",
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await slots(client, interaction);
                    }
                }
            }
        })
    }
}