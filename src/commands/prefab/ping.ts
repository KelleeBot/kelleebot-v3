import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Ping extends KelleeBotCommand {
  constructor(client: Client) {
    super(client, {
      name: "ping",
      description: "Get the bots current ping.",
      category: "Misc",
      clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
      cooldown: 5
    });
  }
  async execute({ client, interaction }: { client: Client; interaction: CommandInteraction; }) {
    await this.setCooldown(interaction);

    const embed = (
      await client.utils.CustomEmbed({ userID: interaction.user.id })
    )
      .setDescription(
        `Pong! Latency is ${Date.now() - interaction.createdTimestamp}ms.`
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}
