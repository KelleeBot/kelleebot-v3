import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { setgambling, setleaderboard, setlog, twitch } from "../../subcommandHelpers/config";

export default class Config extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "config",
            category: "Config",
            description: "Server configurations.",
            perms: ["MANAGE_GUILD"],
            clientPerms: ["SEND_MESSAGES", "MANAGE_WEBHOOKS"],
            subcommands: {
                gambling: {
                    description: "Sets the server's gambling channel to enable gambling.",
                    options: [
                        {
                            name: "channel",
                            description: "The channel to set.",
                            type: Constants.ApplicationCommandOptionTypes.CHANNEL,
                            required: true,
                            channelTypes: ["GUILD_TEXT"]
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await setgambling(client, interaction);
                    }
                },
                leaderboard: {
                    description: "Sets the server's leaderboard channel to show the gambling leaderboard.",
                    options: [
                        {
                            name: "channel",
                            description: "The channel to set.",
                            type: Constants.ApplicationCommandOptionTypes.CHANNEL,
                            required: true,
                            channelTypes: ["GUILD_TEXT"]
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await setleaderboard(client, interaction);
                    }
                },
                log: {
                    description: "Sets the server's bot logging channel.",
                    options: [
                        {
                            name: "channel",
                            description: "The channel to set.",
                            type: Constants.ApplicationCommandOptionTypes.CHANNEL,
                            required: true,
                            channelTypes: ["GUILD_TEXT"]
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await setlog(client, interaction);
                    }
                },
                twitch: {
                    description: "Sets the channel for where Twitch live notifications will be sent.",
                    options: [
                        {
                            name: "twitch",
                            description: "The Twitch channel you'd like to subscribe to.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        },
                        {
                            name: "message",
                            description: "The message you'd like to include with the live notification.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        },
                        {
                            name: "channel",
                            description: "The discord channel where the message will be sent. Default is current channel if none specified.",
                            type: Constants.ApplicationCommandOptionTypes.CHANNEL,
                            channelTypes: ["GUILD_TEXT"]
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await twitch(client, interaction);
                    }
                }
            }
        });
    }
}
