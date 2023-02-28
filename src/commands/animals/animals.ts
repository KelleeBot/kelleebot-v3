import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import * as animals from "../../subcommandHelpers/animals";

export default class Animals extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "animals",
            category: "Animals",
            description: `${client.user?.username} shows you a random picture of the specified animal.`,
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            subcommands: {
                bunny: {
                    description: `${client.user?.username} shows you a random picture/gif of a bunny.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await animals.bunny(client, interaction);
                    }
                },
                cat: {
                    description: `${client.user?.username} shows you a random picture of a cat and provides you with a random cat fact.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await animals.cat(client, interaction);
                    }
                },
                dog: {
                    description: `${client.user?.username} shows you a random picture of a dog and provides you with a random dog fact.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await animals.dog(client, interaction);
                    }
                },
                duck: {
                    description: `${client.user?.username} shows you a random picture of a duck.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await animals.duck(client, interaction);
                    }
                },
                fox: {
                    description: `${client.user?.username} shows you a random picture of a fox and provides you with a random fox fact.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await animals.fox(client, interaction);
                    }
                },
                koala: {
                    description: `${client.user?.username} shows you a random picture of a koala and provides you with a random koala fact.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await animals.koala(client, interaction);
                    }
                },
                panda: {
                    description: `${client.user?.username} shows you a random picture of a panda and provides you with a random panda fact.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await animals.panda(client, interaction);
                    }
                },
                raccoon: {
                    description: `${client.user?.username} shows you a random picture of a raccoon and provides you with a random raccoon fact.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await animals.raccoon(client, interaction);
                    }
                },
                shiba: {
                    description: `${client.user?.username} shows you a random picture of a shiba.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await animals.shiba(client, interaction);
                    }
                }
            }
        });
    }
}
