import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";
import { Item } from "../../types/animalCrossing";

export const items = async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        const item = interaction.options.getString("item")!;
        const data = await fetchItem(item) as Item;

        const { url, image_url, name, sell, material_type, material_seasonality, availability, buy } = data;

        const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
            .setURL(url)
            .setAuthor({ name, iconURL: image_url, url })
            .setDescription(`More information about the ${name} can be found here:\n${url}`)
            .setThumbnail(image_url)
            .addFields(
                { name: "**Sell Price**", value: client.utils.formatNumber(sell), inline: true },
            )
            .setFooter({
                text: `Powered by Nookipedia`,
                iconURL: `https://nookipedia.com/wikilogo.png`
            });

        if (material_type) {
            msgEmbed.addFields({ name: "**Material Type**", value: material_type, inline: true });
        }

        if (material_seasonality) {
            msgEmbed.addField("**Seasonality**", material_seasonality, true);
        }

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

        msgEmbed.addFields({
            name: "**Availability**",
            value: `${availability
                .map(
                    (avail: { from: string; note: string }) =>
                        `${avail.from}${avail.note ? ` - ${avail.note}` : ""}`
                )
                .join("\n")}`,
            inline: false
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

const fetchItem = async (name: string) => {
    const resp = await axios.get(
        `https://api.nookipedia.com/nh/items/${encodeURIComponent(name.toLowerCase())}`,
        {
            headers: {
                "X-API-KEY": `${process.env.NOOK_API_KEY}`,
                "Accept-Version": "2.0.0"
            }
        }
    );
    return resp.data;
}