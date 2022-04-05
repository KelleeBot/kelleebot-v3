import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { add, remove, send } from "../../subcommandHelpers/roles";

export default class Roles extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "roles",
            category: "Roles",
            description: "Role assignment configuration for the server.",
            perms: ["MANAGE_GUILD"],
            clientPerms: ["SEND_MESSAGES", "MANAGE_ROLES"],
            subcommands: {
                add: {
                    description: "Adds a role to the dropdown menu.",
                    options: [
                        {
                            name: "messageid",
                            description: "The ID of the message to edit.",
                            type: "STRING",
                            required: true
                        },
                        {
                            name: "role",
                            description: "The role you want to add.",
                            type: "ROLE",
                            required: true
                        },
                        {
                            name: "channel",
                            description: "The channel that the message is in. Default is current channel if none specified.",
                            type: "CHANNEL",
                        },
                        {
                            name: "emoji",
                            description: "The emoji you want to associate with the role.",
                            type: "STRING"
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await add(client, interaction);
                    }
                },
                remove: {
                    description: "Removes a role from the dropdwon menu.",
                    options: [
                        {
                            name: "messageid",
                            description: "The ID of the message to edit.",
                            type: "STRING",
                            required: true
                        },
                        {
                            name: "position",
                            description: "The position in the dropdown that the role you want to remove is in.",
                            type: "INTEGER",
                            required: true
                        },
                        {
                            name: "channel",
                            description: "The channel that the message is in. Default is current channel if none specified.",
                            type: "CHANNEL"
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await remove(client, interaction);
                    }
                },
                send: {
                    description: "Sends a message as the bot to be used for roles assignment.",
                    options: [
                        {
                            name: "message",
                            description: "The message to send.",
                            type: "STRING",
                            required: true
                        },
                        {
                            name: "channel",
                            description: "The channel to send the message to. Default is current channel if none specified.",
                            type: "CHANNEL"
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await send(client, interaction);
                    }
                }
            }
        });
    }
};
