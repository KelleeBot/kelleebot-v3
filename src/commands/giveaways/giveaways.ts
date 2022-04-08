import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { deleteGiveaway, end, reroll, start } from "../../subcommandHelpers/giveaways";

export default class Giveaways extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "giveaways",
            category: "Giveaways",
            description: "Manage giveaways.",
            perms: ["MANAGE_GUILD"],
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            subcommands: {
                delete: {
                    description: "Delete a giveaway.",
                    options: [
                        {
                            name: "id",
                            description: "The giveaway (message) ID to delete.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await deleteGiveaway(client, interaction);
                    }
                },
                end: {
                    description: "End a giveaway.",
                    options: [
                        {
                            name: "id",
                            description: "The giveaway (message) ID to end.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await end(client, interaction);
                    }
                },
                reroll: {
                    description: "Reroll a giveaway.",
                    options: [
                        {
                            name: "id",
                            description: "The giveaway (message) ID to reroll.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await reroll(client, interaction);
                    }
                },
                start: {
                    description: "Start a giveaway.",
                    options: [
                        {
                            name: "duration",
                            description: "The giveaway duration.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        },
                        {
                            name: "winners",
                            description: "The number of winners.",
                            type: Constants.ApplicationCommandOptionTypes.INTEGER,
                            required: true,
                            minValue: 1
                        },
                        {
                            name: "prize",
                            description: "The giveaway prize.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        },
                        {
                            name: "channel",
                            description: "The channel where the giveaway will be held.",
                            type: Constants.ApplicationCommandOptionTypes.CHANNEL
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await start(client, interaction);
                    }
                }
            }
        });
    }
}
