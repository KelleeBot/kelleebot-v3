import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";
import { Clothing } from "../../types/animalCrossing";

export const clothing = async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        const clothingName = interaction.options.getString("clothing")!;
        const data = await fetchClothing(clothingName) as Clothing;

        const { url, name, sell, category, styles, availability, variations, buy, seasonality } = data;

        const thumbnail = variations.random().image_url;

        const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
            .setURL(url)
            .setAuthor({ name, iconURL: thumbnail, url })
            .setDescription(
                `More information about the ${name} can be found here:\n${url}`
            )
            .setThumbnail(thumbnail)
            .addFields(
                {
                    name: "**Sell Price**",
                    value: client.utils.formatNumber(sell),
                    inline: true
                },
                {
                    name: "**Category**",
                    value: category,
                    inline: true
                },
                {
                    name: "**Styles**",
                    value: styles.join(", "),
                    inline: true
                },
                {
                    name: "**Seasonality**",
                    value: seasonality,
                    inline: true
                },
                {
                    name: "**Availability**",
                    value: `${availability
                        .map((avail: { from: string }) => `${avail.from}`)
                        .join("\n")}`,
                    inline: true
                }
            )
            .setFooter({
                text: `Powered by Nookipedia`,
                iconURL: `https://nookipedia.com/wikilogo.png`
            });

        if (buy.length > 0) {
            msgEmbed.addFields({
                name: `**Buy Price**`,
                value: `${buy
                    .map(
                        (b: { price: number; currency: string }) =>
                            `${client.utils.formatNumber(b.price)} ${b.currency}`
                    )
                    .join("\n")}`,
                inline: true
            });
        }

        if (variations.length > 1) {
            msgEmbed.addFields({
                name: `**Variations [${variations.length}]**`,
                value: `${variations
                    .map((v: { variation: string }) => `${v.variation}`)
                    .join(", ")}`,
                inline: true
            });
        }
        return interaction.editReply({ embeds: [msgEmbed] });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.editReply({
            content: "An error has occurred. Please try again."
        });
    }
}

const fetchClothing = async (name: string) => {
    const resp = await axios.get(
        `https://api.nookipedia.com/nh/clothing/${encodeURIComponent(name.toLowerCase())}`,
        {
            headers: {
                "X-API-KEY": `${process.env.NOOK_API_KEY}`,
                "Accept-Version": "2.0.0"
            }
        }
    );
    return resp.data;
};