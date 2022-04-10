import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { ban, history, kick, purge, softban, timeout, unban } from "../../subcommandHelpers/moderation";

export default class Moderation extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "moderation",
            category: "Moderation",
            description: "Commands used for moderation purposes.",
            perms: ["BAN_MEMBERS", "KICK_MEMBERS", "MODERATE_MEMBERS", "MANAGE_MESSAGES"],
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS", "BAN_MEMBERS", "KICK_MEMBERS", "MODERATE_MEMBERS"],
            subcommands: {
                ban: {
                    description: "Ban a user.",
                    options: [
                        {
                            name: "user",
                            description: "The user to ban.",
                            type: Constants.ApplicationCommandOptionTypes.USER,
                            required: true
                        },
                        {
                            name: "reason",
                            description: "Reason why the user is being banned.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await ban(client, interaction);
                    }
                },
                history: {
                    description: "See moderation history of a user.",
                    options: [
                        {
                            name: "user",
                            description: "The user to see moderation history for.",
                            type: Constants.ApplicationCommandOptionTypes.USER,
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await history(client, interaction);
                    }
                },
                kick: {
                    description: "Kicks a member from the server.",
                    options: [
                        {
                            name: "member",
                            description: "The member to kick.",
                            type: Constants.ApplicationCommandOptionTypes.USER,
                            required: true
                        },
                        {
                            name: "reason",
                            description: "Reason why member is being kicked.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await kick(client, interaction);
                    }
                },
                purge: {
                    description: "Purge messages from a channel.",
                    options: [
                        {
                            name: "number",
                            description: "The number of messages to purge (between 1 - 100).",
                            type: Constants.ApplicationCommandOptionTypes.INTEGER,
                            required: true,
                            minValue: 1,
                            maxValue: 100
                        },
                        {
                            name: "channel",
                            description: "The channel to purge messages from.",
                            type: Constants.ApplicationCommandOptionTypes.CHANNEL,
                            channelTypes: ["GUILD_TEXT"]
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await purge(client, interaction);
                    }
                },
                softban: {
                    description: "Softban a user.",
                    options: [
                        {
                            name: "user",
                            description: "The user to softban.",
                            type: Constants.ApplicationCommandOptionTypes.USER,
                            required: true
                        },
                        {
                            name: "reason",
                            description: "Reason why the user is being softbanned.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await softban(client, interaction);
                    }
                },
                timeout: {
                    description: "Timeout a member.",
                    options: [
                        {
                            name: "member",
                            description: "The member to timeout.",
                            type: Constants.ApplicationCommandOptionTypes.USER,
                            required: true
                        },
                        {
                            name: "duration",
                            description: "How long to timeout the member for.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        },
                        {
                            name: "reason",
                            description: "Reason why member is being timed out.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        },
                        {
                            name: "dm",
                            description: "Whether or not to DM the member about them being timed out (default no).",
                            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await timeout(client, interaction);
                    }
                },
                unban: {
                    description: "Unban's a user from the server.",
                    options: [
                        {
                            name: "id",
                            description: "The ID of the user you want to unban.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        },
                        {
                            name: "reason",
                            description: "The reason why this user is being unbanned.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await unban(client, interaction);
                    }
                }
            }
        });
    }
}
