import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { lyrics, play } from "../../subcommandHelpers/music";

export default class Music extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "music",
            category: "Music",
            description: "Listen to some music.",
            clientPerms: ["SEND_MESSAGES", "SPEAK", "CONNECT", "EMBED_LINKS"],
            cooldown: 15,
            subcommands: {
                lyrics: {
                    description: "Search lyrics for either the current song or the specified song.",
                    args: [
                        {
                            name: "query",
                            description: "The song to search for.",
                            type: "STRING"
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        //this.setCooldown(interaction);
                        await lyrics(client, interaction);
                    }
                },
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