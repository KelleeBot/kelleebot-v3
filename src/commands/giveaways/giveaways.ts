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
                    args: [
                        {
                            name: "id",
                            description: "The giveaway (message) ID to delete.",
                            type: "STRING",
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await deleteGiveaway(client, interaction);
                    }
                },
                end: {
                    description: "End a giveaway.",
                    args: [
                        {
                            name: "id",
                            description: "The giveaway (message) ID to end.",
                            type: "STRING",
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await end(client, interaction);
                    }
                },
                reroll: {
                    description: "Reroll a giveaway.",
                    args: [
                        {
                            name: "id",
                            description: "The giveaway (message) ID to reroll.",
                            type: "STRING",
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await reroll(client, interaction);
                    }
                },
                start: {
                    description: "Start a giveaway.",
                    args: [
                        {
                            name: "duration",
                            description: "The giveaway duration.",
                            type: "STRING",
                            required: true
                        },
                        {
                            name: "winners",
                            description: "The number of winners.",
                            type: "NUMBER",
                            required: true
                        },
                        {
                            name: "prize",
                            description: "The giveaway prize.",
                            type: "STRING",
                            required: true
                        },
                        {
                            name: "channel",
                            description: "The channel where the giveaway will be held.",
                            type: "CHANNEL"
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
