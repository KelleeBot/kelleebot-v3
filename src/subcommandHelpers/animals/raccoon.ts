import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";

export const raccoon = async (
  client: Client,
  interaction: CommandInteraction
) => {
  await interaction.deferReply();
  try {
    const resp = await axios.get("https://some-random-api.com/animal/raccoon");
    const { data } = resp;

    const msgEmbed = (
      await client.utils.CustomEmbed({ userID: interaction.user.id })
    )
      .setAuthor({
        name: "Raccoon",
        iconURL: "https://i.imgur.com/XOrMUFd.png",
        url: data.image
      })
      .setURL(data.image)
      .setImage(data.image)
      .addFields({
        name: "**Random Raccoon Fact**",
        value: data.fact,
        inline: true
      });
    return interaction.editReply({
      content: "Found one!",
      embeds: [msgEmbed]
    });
  } catch (e) {
    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
    return interaction.editReply({
      content:
        "Oops! Looks like an error occurred. No racoon pics as of right now :("
    });
  }
};
