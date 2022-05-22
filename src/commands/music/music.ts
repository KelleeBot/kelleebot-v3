import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import * as music from "../../subcommandHelpers/music";

export default class Music extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "music",
            category: "Music",
            description: "Listen to some music.",
            clientPerms: ["SEND_MESSAGES", "SPEAK", "CONNECT", "EMBED_LINKS"],
            subcommands: {
                clear: {
                    description: "Clears the music queue.",
                    execute: async ({ client, interaction }) => {
                        await music.clear(client, interaction);
                    }
                },
                np: {
                    description: "Shows what's currently playing.",
                    execute: async ({ client, interaction }) => {
                        this.setCooldown(interaction);
                        await music.np(client, interaction);
                    }
                },
                pause: {
                    description: "Pauses the music.",
                    execute: async ({ client, interaction }) => {
                        await music.pause(client, interaction);
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
                        await music.play(client, interaction);
                    }
                },
                queue: {
                    description: "Shows you all the songs that are currently in the queue.",
                    execute: async ({ client, interaction }) => {
                        this.setCooldown(interaction);
                        await music.queue(client, interaction);
                    }
                },
                resume: {
                    description: "Resumes the music.",
                    execute: async ({ client, interaction }) => {
                        await music.resume(client, interaction);
                    }
                },
                skip: {
                    description: "Skips the current song.",
                    execute: async ({ client, interaction }) => {
                        await music.skip(client, interaction);
                    }
                },
                stop: {
                    description: "Stops the music and clears the queue.",
                    execute: async ({ client, interaction }) => {
                        await music.stop(client, interaction);
                    }
                },
                volume: {
                    description: "Changes the volume of the music.",
                    options: [
                        {
                            name: "volume",
                            description: "The volume you want to set the music to.",
                            type: Constants.ApplicationCommandOptionTypes.INTEGER,
                            required: true,
                            minValue: 0,
                            maxValue: 100
                        }
                    ],
                    execute: async ({ client, interaction }) => {
                        await music.volume(client, interaction);
                    }
                }
            }
        });
    }
}
