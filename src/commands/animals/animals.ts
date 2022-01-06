import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { cat, panda } from "./";

export default class Animals extends KelleeBotCommand {
  constructor(client: Client) {
    super(client, {
      name: "animals",
      category: "Animals",
      description: `${client.user?.username} shows you a random picture of the specified animal.`,
      cooldown: 15,
      clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
      subcommands: {
        cat: {
          description: `${client.user?.username} shows you a random picture of a cat and provides you with a random cat fact.`,
          execute: async ({ client, interaction }) => {
            await this.setCooldown(interaction);
            await cat(client, interaction);
          }
        },
        panda: {
          description: `${client.user?.username} shows you a random picture of a panda and provides you with a random panda fact.`,
          execute: async ({ client, interaction }) => {
            await this.setCooldown(interaction);
            await panda(client, interaction);
          }
        }
      }
    });
  }
}
