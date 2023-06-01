import { Constants, GuildMember } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { addPoints } from "../../util";
import { GREATER_THAN_ZERO } from "../../../config/messages.json";

export default class Add extends KelleeBotCommand {
  constructor(client: Client) {
    super(client, {
      name: "add",
      category: "Admin",
      description: "Add points to members.",
      perms: ["MANAGE_GUILD"],
      clientPerms: ["SEND_MESSAGES"],
      options: [
        {
          name: "points",
          description: "The amount of points to give.",
          type: "INTEGER",
          required: true,
          minValue: 1
        },
        {
          name: "user",
          description:
            "The user to give points to. Defaults 'all' if no user specified.",
          type: "USER"
        }
      ],
      execute: async ({ client, interaction }) => {
        const points = interaction.options.getInteger("points")!;
        const member = interaction.options.getMember("user") ?? "all";

        // if (points <= 0) return await interaction.reply({ content: GREATER_THAN_ZERO });

        try {
          if (member === "all") {
            const members = await interaction.guild?.members.fetch();
            members?.forEach(async (member) => {
              if (!member.user.bot)
                await addPoints(interaction.guildId!, member.id, points);
            });

            const memberCount = members?.filter((member) => !member.user.bot)
              .size!;
            return await interaction.reply({
              content: `You have successfully added ${client.utils.pluralize(
                points,
                "point",
                true
              )} to ${client.utils.pluralize(memberCount, "member")}.`
            });
          }

          if ((member as GuildMember).user.bot)
            return await interaction.reply({
              content: "You cannot give points to bots."
            });

          const newPoints = await addPoints(
            interaction.guildId!,
            (member as GuildMember).id,
            points
          );
          return await interaction.reply({
            content: `You have given **${
              (member as GuildMember).user.tag
            }** ${client.utils.pluralize(
              points,
              "point",
              true
            )}. They now have ${client.utils.pluralize(
              newPoints,
              "point",
              true
            )}.`
          });
        } catch (e) {
          client.utils.log(
            "ERROR",
            `${__filename}`,
            `An error has occurred: ${e}`
          );
          return await interaction.reply({
            content: "An error has occurred. Please try again."
          });
        }
      }
    });
  }
}
