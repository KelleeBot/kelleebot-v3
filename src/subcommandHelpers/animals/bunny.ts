import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";

export const bunny = async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        const resp = await axios.get("https://api.bunnies.io/v2/loop/random/?media=gif,png");
        const { data } = resp;

        const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
            .setAuthor({
                name: "Bunny",
                iconURL: "https://i.imgur.com/VUbJXOA.png",
                url: data.media.gif
            })
            .setURL(data.image)
            .setImage(data.image)
            .setURL(data.media.gif)
            .setImage(data.media.gif);

        return interaction.editReply({
            content: "Found one!",
            embeds: [msgEmbed]
        });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.editReply({
            content: "Oops! Looks like an error occurred. No bunny pics as of right now :("
        });
    }
};
