import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { play } from "../../subcommandHelpers/music";

export default class Music extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "music",
            category: "Music",
            description: "Listen to some music.",
            clientPerms: ["SEND_MESSAGES", "SPEAK", "CONNECT", "EMBED_LINKS"],
            cooldown: 15,
            subcommands: {
                play: {
                    description: "Play some music.",
                    args: [
                        {
                            name: "query",
                            description: "The song you want to play.",
                            type: "STRING",
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await play(client, interaction);
                    }
                }
            }
        });
    }
};