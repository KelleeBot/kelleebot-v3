import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { setlog } from "../../subcommandHelpers/config";

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
                }
            }
        });
    }
}
