import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Commands extends KelleeBotCommand {
  constructor(client: Client) {
    super(client, {
      name: "commands",
      description: "Disable/enable commands.",
      category: "Utility",
      canNotDisable: true,
      ignoreDisabledChannels: true,
      ownerOnly: true,
      clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
      cooldown: 5,
      subcommands: {
        list: {
          description: "List all disabled commands.",
          execute: async ({ client, interaction }) => {
            await this.setCooldown(interaction);

            const guildInfo = await client.guildInfo.get(interaction.guildId!);

            const embed = (
              await client.utils.CustomEmbed({ userID: interaction.user.id })
            ).setTimestamp();

            if (!guildInfo?.disabledCommands?.length) {
              embed.setDescription(
                `${interaction.user}, there are currently no disabled commands in this server.`
              );
            } else {
              embed.setDescription(
                `${
                  interaction.user
                }, these are the disabled commands:\n\`${guildInfo.disabledCommands.join(
                  "`, `"
                )}\``
              );
            }

            return await interaction.reply({ embeds: [embed] });
          }
        },
        disable: {
          description: "Disable a command",
          options: [
            {
              name: "command",
              description: "The command you want to disable.",
              type: "STRING",
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            await this.setCooldown(interaction);

            const guildInfo = await client.guildInfo.get(interaction.guildId!);

            const embed = (
              await client.utils.CustomEmbed({ userID: interaction.user.id })
            ).setTimestamp();

            const name = interaction.options
              .getString("command")!
              .toLowerCase();

            const command = client.commands.get(name);

            if (!command)
              embed.setDescription(
                `${interaction.user}, the command \`${name}\` does not exist.`
              );
            else if (command.canNotDisable)
              embed.setDescription(
                `${interaction.user}, the command \`${command.name}\` can not be disabled.`
              );
            else if (guildInfo?.disabledCommands?.includes(command.name))
              embed.setDescription(
                `${interaction.user}, the command \`${command.name}\` is already disabled.`
              );
            else {
              await client.guildInfo.findByIdAndUpdate(
                interaction.guildId!,
                { $push: { disabledCommands: command.name } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
              );
              embed.setDescription(
                `${interaction.user}, the command \`${command.name}\` has been disabled.`
              );
            }

            return await interaction.reply({ embeds: [embed] });
          }
        },
        enable: {
          description: "Enable a command",
          options: [
            {
              name: "command",
              description: "The command you want to enable.",
              type: "STRING",
              required: true
            }
          ],
          execute: async ({ client, interaction }) => {
            await this.setCooldown(interaction);

            const guildInfo = await client.guildInfo.get(interaction.guildId!);

            const embed = (
              await client.utils.CustomEmbed({ userID: interaction.user.id })
            ).setTimestamp();

            const name = interaction.options
              .getString("command")!
              .toLowerCase();

            const command = client.commands.get(name);

            if (!command)
              embed.setDescription(
                `${interaction.user}, the command \`${name}\` does not exist.`
              );
            else if (command.canNotDisable)
              embed.setDescription(
                `${interaction.user}, the command \`${command.name}\` can not be enabled.`
              );
            else if (!guildInfo?.disabledCommands?.includes(command.name))
              embed.setDescription(
                `${interaction.user}, the command \`${command.name}\` is already enabled.`
              );
            else {
              await client.guildInfo.findByIdAndUpdate(
                interaction.guildId!,
                { $pull: { disabledCommands: command.name } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
              );

              embed.setDescription(
                `${interaction.user}, the command \`${command.name}\` has been enabled.`
              );
            }

            return await interaction.reply({ embeds: [embed] });
          }
        }
      }
    });
  }
}
