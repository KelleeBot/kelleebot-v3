import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import * as moderation from "../../subcommandHelpers/moderation";

export default class Moderation extends KelleeBotCommand {
  constructor(client: Client) {
    super(client, {
      name: "moderation",
      category: "Moderation",
      description: "Commands used for moderation purposes.",
      perms: ["KICK_MEMBERS", "MODERATE_MEMBERS", "MANAGE_MESSAGES"],
      clientPerms: [
        "SEND_MESSAGES",
        "EMBED_LINKS",
        "BAN_MEMBERS",
        "KICK_MEMBERS",
        "MODERATE_MEMBERS"
      ],
      subcommands: {
        ban: {
          description: "Ban a user.",
          options: [
            {
              name: "user",
              description: "The user to ban.",
              type: "USER",
              required: true
            },
            {
              name: "reason",
              description: "Reason why the user is being banned.",
              type: "STRING",
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            await moderation.ban(client, interaction);
          }
        },
        history: {
          description: "See moderation history of a user.",
          options: [
            {
              name: "user",
              description: "The user to see moderation history for.",
              type: "USER",
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            await moderation.history(client, interaction);
          }
        },
        kick: {
          description: "Kicks a member from the server.",
          options: [
            {
              name: "member",
              description: "The member to kick.",
              type: "USER",
              required: true
            },
            {
              name: "reason",
              description: "Reason why member is being kicked.",
              type: "STRING",
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            await moderation.kick(client, interaction);
          }
        },
        purge: {
          description: "Purge messages from a channel.",
          options: [
            {
              name: "number",
              description: "The number of messages to purge (between 1 - 100).",
              type: "INTEGER",
              required: true,
              minValue: 1,
              maxValue: 100
            },
            {
              name: "channel",
              description: "The channel to purge messages from.",
              type: "CHANNEL",
              channelTypes: ["GUILD_TEXT"]
            }
          ],
          execute: async ({ client, interaction }) => {
            await moderation.purge(client, interaction);
          }
        },
        softban: {
          description: "Softban a user.",
          options: [
            {
              name: "user",
              description: "The user to softban.",
              type: "USER",
              required: true
            },
            {
              name: "reason",
              description: "Reason why the user is being softbanned.",
              type: "STRING",
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            await moderation.softban(client, interaction);
          }
        },
        timeout: {
          description: "Timeout a member.",
          options: [
            {
              name: "member",
              description: "The member to timeout.",
              type: "USER",
              required: true
            },
            {
              name: "duration",
              description: "How long to timeout the member for.",
              type: "STRING",
              required: true
            },
            {
              name: "reason",
              description: "Reason why member is being timed out.",
              type: "STRING",
              required: true
            },
            {
              name: "dm",
              description:
                "Whether or not to DM the member about them being timed out (default no).",
              type: "BOOLEAN"
            }
          ],
          execute: async ({ client, interaction }) => {
            await moderation.timeout(client, interaction);
          }
        },
        unban: {
          description: "Unban's a user from the server.",
          options: [
            {
              name: "id",
              description: "The ID of the user you want to unban.",
              type: "STRING",
              required: true
            },
            {
              name: "reason",
              description: "The reason why this user is being unbanned.",
              type: "STRING",
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            await moderation.unban(client, interaction);
          }
        },
        warn: {
          description: "Warn a member.",
          options: [
            {
              name: "member",
              description: "The member to warn.",
              type: "USER",
              required: true
            },
            {
              name: "reason",
              description: "Reason why member is being warned.",
              type: "STRING",
              required: true
            },
            {
              name: "dm",
              description:
                "Whether or not to DM the member about them being warned (default no).",
              type: "BOOLEAN"
            }
          ],
          execute: async ({ client, interaction }) => {
            await moderation.warn(client, interaction);
          }
        }
      }
    });
  }
}
