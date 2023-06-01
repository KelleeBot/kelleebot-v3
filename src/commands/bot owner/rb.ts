import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Rb extends KelleeBotCommand {
  constructor(client: Client) {
    super(client, {
      name: "rb",
      category: "Bot Owner",
      devOnly: true,
      development: true,
      hideCommand: true,
      description: "You can't use this command, so why bother explaining.",
      options: [
        {
          name: "guildid",
          description: "The guild to send the message to.",
          type: "STRING",
          required: true
        },
        {
          name: "channelid",
          description: "The channel to send the message to.",
          type: "STRING",
          // type: "CHANNEL",
          // channelTypes: ["GUILD_TEXT"],
          required: true
        }
      ],
      execute: async ({ interaction }) => {
        try {
          const guildID = interaction.options.getString("guildid")!;
          const channelID = interaction.options.getString("channelid")!;
          //const channel = interaction.options.getChannel("channel")!; // ?? interaction.channel;

          const button = client.utils
            .createActionRow()
            .addComponents(
              client.utils
                .createButton()
                .setCustomId("roles")
                .setLabel("List current roles")
                .setStyle("PRIMARY")
            );

          const guild = await client.guilds.fetch(guildID);
          if (!guild)
            return await interaction.reply({
              content: "A guild with that ID was not found.",
              ephemeral: true
            });

          const channel = await guild.channels.fetch(channelID);
          if (!channel)
            return await interaction.reply({
              content: "A channel with that ID was not found.",
              ephemeral: true
            });

          if (channel.type !== "GUILD_TEXT")
            return await interaction.reply({
              content: "Please ensure that the channel is a text channel.",
              ephemeral: true
            });

          await interaction.reply({
            content: `Role button message successully sent to ${channel}.`,
            ephemeral: true
          });
          return await channel.send({
            content:
              "Unsure which roles you currently already have? Click here:",
            components: [button]
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
