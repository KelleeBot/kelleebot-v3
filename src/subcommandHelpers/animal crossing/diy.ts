import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";
import { Recipe } from "../../types/animalCrossing";

export const diy = async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        const recipe = interaction.options.getString("diy")!;
        const data = await fetchRecipe(recipe) as Recipe;

        const { url, name, image_url, availability, materials } = data;

        const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
            .setURL(url)
            .setAuthor({ name, iconURL: image_url, url })
            .setDescription(`More info about the ${name} can be found here:\n${url}`)
            .setThumbnail(image_url)
            .addFields(
                {
                    name: "**Materials**",
                    value: `${materials
                        .map(
                            (mat: { count: number; name: string }) =>
                                `${mat.count}x ${mat.name}`
                        )
                        .join("\n")}`,
                    inline: true
                },
                {
                    name: "**Obtained From**",
                    value: `${availability
                        .map((avail: { from: string }) => `${avail.from}`)
                        .join("\n")}`,
                    inline: true
                },
                {
                    name: "**Note**",
                    value:
                        availability.map((avail: { note: string }) => `${avail.note}`)
                            .length == 1
                            ? "-"
                            : `${availability
                                .map((avail: { note: string }) => `${avail.note}`)
                                .join("\n")}`,
                    inline: true
                }
            )
            .setFooter({
                text: `Powered by Nookipedia`,
                iconURL: `https://nookipedia.com/wikilogo.png`
            });
        return interaction.editReply({ embeds: [msgEmbed] });
    }
    catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.editReply({
            content: "An error has occurred. Please try again."
        });
    }
};

const fetchRecipe = async (name: string) => {
    const resp = await axios.get(
        `https://api.nookipedia.com/nh/recipes/${encodeURIComponent(name.toLowerCase())}`,
        {
            headers: {
                "X-API-KEY": `${process.env.NOOK_API_KEY}`,
                "Accept-Version": "2.0.0"
            }
        }
    );
    return resp.data;
}