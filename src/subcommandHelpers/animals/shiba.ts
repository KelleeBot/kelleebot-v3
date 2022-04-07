import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";

export const shiba = async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        const resp = await axios.get("http://shibe.online/api/shibes");
        const { data } = resp;

        const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
            .setAuthor({
                name: "Woof!",
                iconURL: "https://i.imgur.com/cVR3t51.png",
                url: data[0]
            })
            .setURL(data[0])
            .setImage(data[0]);
        return interaction.editReply({
            content: "Found one!",
            embeds: [msgEmbed]
        });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.editReply({
            content: "Oops! Looks like an error occurred. No cute doggo pics as of right now :("
        });
    }
};
