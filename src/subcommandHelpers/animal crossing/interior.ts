import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";
import { Interior } from "../../types/animalCrossing";

export const interior = async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        const item = interaction.options.getString("interior")!;
        const data = await fetchInterior(item) as Interior;

        const { url, image_url, name, sell, category, availability, buy, themes, colors } = data;


        const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
            .setURL(url)
            .setAuthor({ name, iconURL: image_url, url })
            .setDescription(`More information about the ${name} can be found here:\n${url}`)
            .setThumbnail(image_url)
            .addFields(
                { name: "**Sell Price**", value: client.utils.formatNumber(sell), inline: true },
                { name: "**Category**", value: category, inline: true },
                { name: "**Themes**", value: themes.join(", "), inline: true },
                { name: `**Colors [${colors.length}]**`, value: colors.join(", "), inline: true },
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
        return interaction.editReply({ embeds: [msgEmbed] });
    }
    catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.editReply({
            content: "An error has occurred. Please try again."
        });
    }
};

const fetchInterior = async (name: string) => {
    const resp = await axios.get(
        `https://api.nookipedia.com/nh/interior/${encodeURIComponent(name.toLowerCase())}`,
        {
            headers: {
                "X-API-KEY": `${process.env.NOOK_API_KEY}`,
                "Accept-Version": "2.0.0"
            }
        }
    );
    return resp.data;
}