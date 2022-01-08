import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { history, timeout } from ".";

export default class Moderation extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "moderation",
            category: "Moderation",
            description: "Commands used for moderation purposes.",
            perms: ["BAN_MEMBERS", "KICK_MEMBERS", "MODERATE_MEMBERS"],
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "BAN_MEMBERS", "KICK_MEMBERS", "MODERATE_MEMBERS"],
            subcommands: {
                history: {
                    description: "See moderation history of a user.",
                    args: [
                        {
                            name: "user",
                            description: "The user to see moderation history for.",
                            type: "USER",
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await history(client, interaction);
                    }
                },
                timeout: {
                    description: "Timeout a member.",
                    args: [
                        {
                            name: "member",
                            description: "The member to timeout.",
                            type: "USER",
                            required: true
                        },
                        {
                            name: "duration",
                            description: "How long to timeout the member for.",
                            type: "STRING",
                            required: true
                        },
                        {
                            name: "reason",
                            description: "Reason why member is being timed out.",
                            type: "STRING",
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await timeout(client, interaction);
                    }
                }
            }
        });
    }
};