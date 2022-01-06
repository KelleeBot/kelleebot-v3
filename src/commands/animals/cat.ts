import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";

export const cat = async (client: Client, interaction: CommandInteraction) => {
  await interaction.deferReply();
  try {
    const resp = await axios.get("https://some-random-api.ml/animal/cat");
    const { data } = resp;

    const msgEmbed = (
      await client.utils.CustomEmbed({ userID: interaction.user.id })
    )
      .setAuthor({
        name: "Meow",
        iconURL: "https://i.imgur.com/tIpfnH6.png",
        url: data.image
      })
      .setURL(data.image)
      .setImage(data.image)
      .addField("**Random Cat Fact**", data.fact, true);
    return interaction.editReply({
      content: "Found one!",
      embeds: [msgEmbed]
    });
  } catch (e) {
    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
    return interaction.editReply({
      content: "Looks like an error has occurred. Please try again."
    });
  }
};
