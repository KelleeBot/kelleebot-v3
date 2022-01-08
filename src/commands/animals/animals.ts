import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { bunny, cat, dog, fox, koala, panda, shiba } from "../../subcommandHelpers/animals";

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
                        await bunny(client, interaction);
                    }
                },
                cat: {
                    description: `${client.user?.username} shows you a random picture of a cat and provides you with a random cat fact.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await cat(client, interaction);
                    }
                },
                dog: {
                    description: `${client.user?.username} shows you a random picture of a dog and provides you with a random dog fact.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await dog(client, interaction);
                    }
                },
                fox: {
                    description: `${client.user?.username} shows you a random picture of a fox and provides you with a random fox fact.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await fox(client, interaction);
                    }
                },
                koala: {
                    description: `${client.user?.username} shows you a random picture of a koala and provides you with a random koala fact.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await koala(client, interaction);
                    }
                },
                panda: {
                    description: `${client.user?.username} shows you a random picture of a panda and provides you with a random panda fact.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await panda(client, interaction);
                    }
                },
                shiba: {
                    description: `${client.user?.username} shows you a random picture of a shiba.`,
                    execute: async ({ client, interaction }) => {
                        await this.setCooldown(interaction);
                        await shiba(client, interaction);
                    }
                }
            }
        });
    }
}
