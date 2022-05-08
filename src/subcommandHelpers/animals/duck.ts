import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";

export const duck = async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        const resp = await axios.get("https://random-d.uk/api/v2/random");
        const { data } = resp;

        const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
            .setAuthor({
                name: "Quack",
                iconURL: "https://i.imgur.com/KQ1jger.png",
                url: data.url
            })
            .setURL(data.url)
            .setImage(data.url)
        return interaction.editReply({
            content: "Found one!",
            embeds: [msgEmbed]
        });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.editReply({
            content: "Oops! Looks like an error occurred. No cute duck pics as of right now :("
        });
    }
};
