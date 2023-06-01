import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { NO_GAMBLING_CHANNEL_SET } from "../../../config/messages.json";

const nitroRegExp = /(?:https?:\/\/)?(?:www\.)?discord.gift\/(\S+)/;

export default class Setnitro extends KelleeBotCommand {
  constructor(client: Client) {
    super(client, {
      name: "setnitro",
      category: "Bot Owner",
      description: "Sets the Discord Nitro link.",
      devOnly: true,
      development: true,
      hideCommand: true,
      options: [
        {
          name: "guildid",
          description: "The ID of the guild to set the Nitro link for.",
          type: "STRING",
          required: true
        },
        {
          name: "link",
          description: "The Nitro link.",
          type: "STRING",
          required: true
        }
      ],
      execute: async ({ client, interaction }) => {
        try {
          const id = interaction.options.getString("guildid")!;
          const link = interaction.options.getString("link")!;

          const guildInfo = await client.guildInfo.get(id);
          if (!guildInfo.gambling.gamblingChannel)
            return await interaction.reply({
              content: NO_GAMBLING_CHANNEL_SET,
              ephemeral: true
            });

          if (!nitroRegExp.test(link))
            return await interaction.reply({
              content: "Invalid Nitro link. Please try again.",
              ephemeral: true
            });

          await client.guildInfo.findByIdAndUpdate(
            id,
            { "gambling.nitroLink": link },
            { new: true, upsert: true, setDefaultsOnInsert: true }
          );

          return await interaction.reply({
            content: "Discord Nitro link successfully updated.",
            ephemeral: true
          });
        } catch (e) {
          client.utils.log(
            "ERROR",
            `${__filename}`,
            `An error has occurred: ${e}`
          );
          return await interaction.reply({
            content: "An error has occurred. Please try again.",
            ephemeral: true
          });
        }
      }
    });
  }
}
