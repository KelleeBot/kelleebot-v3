import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Color extends KelleeBotCommand {
  constructor(client: Client) {
    super(client, {
      name: "color",
      description: "Set your own embed color.",
      category: "Utility",
      clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
      cooldown: 30,
      options: [
        {
          name: "color",
          description: "The new color you want",
          type: "STRING",
          required: true,
          choices: Object.keys(client.colors).map((c) => { return { name: c, value: c } })
        }
      ]
    });
  }
  async execute({ client, interaction }: { client: Client; interaction: CommandInteraction; }) {
    try {
      await this.setCooldown(interaction);
      const color = interaction.options.getString("color")!;

      const embed = (
        await client.utils.CustomEmbed({ userID: interaction.user.id })
      )
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      embed
        .setDescription(`Your embed color has successfully been changed to \`${color}\`.`)
        .setColor(client.colors[color]);

      await client.profileInfo.findByIdAndUpdate(
        interaction.user.id,
        { $set: { embedColor: color } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      return await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (e) {
      client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
      return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
  }
}
