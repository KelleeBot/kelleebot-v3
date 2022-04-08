import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { clear, lyrics, np, play, queue, stop } from "../../subcommandHelpers/music";

export default class Music extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "music",
            category: "Music",
            description: "Listen to some music.",
            clientPerms: ["SEND_MESSAGES", "SPEAK", "CONNECT", "EMBED_LINKS"],
            cooldown: 15,
            subcommands: {
                clear: {
                    description: "Clears the music queue.",
                    execute: async ({ client, interaction }) => {
                        await clear(client, interaction);
                    }
                },
                lyrics: {
                    description: "Search lyrics for either the current song or the specified song.",
                    options: [
                        {
                            name: "query",
                            description: "The song to search for.",
                            type: Constants.ApplicationCommandOptionTypes.STRING
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        this.setCooldown(interaction);
                        await lyrics(client, interaction);
                    }
                },
                np: {
                    description: "Shows what's currently playing.",
                    execute: async ({ client, interaction }) => {
                        this.setCooldown(interaction);
                        await np(client, interaction);
                    }
                },
                play: {
                    description: "Play some music.",
                    options: [
                        {
                            name: "query",
                            description: "The song you want to play.",
                            type: Constants.ApplicationCommandOptionTypes.STRING,
                            required: true
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await play(client, interaction);
                    }
                },
                queue: {
                    description: "Shows you all the songs that are currently in the queue.",
                    execute: async ({ client, interaction }) => {
                        this.setCooldown(interaction);
                        await queue(client, interaction);
                    }
                },
                stop: {
                    description: "Stops the music and clears the queue.",
                    execute: async ({ client, interaction }) => {
                        await stop(client, interaction);
                    }
                }
            }
        });
    }
}
