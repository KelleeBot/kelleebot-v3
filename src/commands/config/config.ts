import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { setlog, twitch } from "../../subcommandHelpers/config";

export default class Config extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "config",
            category: "Config",
            description: "Server configurations.",
            perms: ["MANAGE_GUILD"],
            clientPerms: ["SEND_MESSAGES", "MANAGE_WEBHOOKS"],
            subcommands: {
                setlog: {
                    description: "Sets the server's bot logging channel.",
                    args: [
                        {
                            name: "channel",
                            description: "The channel to set.",
                            type: "CHANNEL",
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await setlog(client, interaction);
                    }
                },
                twitch: {
                    description: "Sets the channel for where Twitch live notifications will be sent.",
                    args: [
                        {
                            name: "twitch",
                            description: "The Twitch channel you'd like to subscribe to.",
                            type: "STRING",
                            required: true
                        },
                        {
                            name: "message",
                            description: "The message you'd like to include with the live notification.",
                            type: "STRING",
                            required: true
                        },
                        {
                            name: "channel",
                            description: "The discord channel where the message will be sent. Default is current channel if none specified.",
                            type: "CHANNEL"
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
