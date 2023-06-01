import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import * as tickets from "../../subcommandHelpers/tickets";

export default class Ticket extends KelleeBotCommand {
  constructor(client: Client) {
    super(client, {
      name: "ticket",
      category: "Tickets",
      description: "Sets up a ticketing system for the server.",
      perms: ["MANAGE_MESSAGES"],
      clientPerms: ["SEND_MESSAGES", "MANAGE_CHANNELS", "MANAGE_MESSAGES"],
      subcommands: {
        close: {
          description: "Closes the current ticket.",
          execute: async ({ client, interaction }) => {
            await tickets.close(client, interaction);
          }
        },
        setup: {
          description: "Sets up channels where tickets will be created.",
          options: [
            {
              name: "channel",
              description: "The channel to setup ticket panel.",
              type: "CHANNEL",
              channelTypes: [Constants.ChannelTypes.GUILD_TEXT]
            },
            {
              name: "category",
              description:
                "Where to place all tickets when a ticket is created.",
              type: "CHANNEL",
              channelTypes: [Constants.ChannelTypes.GUILD_CATEGORY]
            },
            {
              name: "mod-role",
              description:
                "The mod role so that mod's can see created tickets.",
              type: "ROLE"
            }
          ],
          execute: async ({ client, interaction }) => {
            await tickets.setup(client, interaction);
          }
        }
      }
    });
  }
}
