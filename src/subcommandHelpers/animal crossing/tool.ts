import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";
import { Tool } from "../../types/animalCrossing";

export const tool = async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        const tool = interaction.options.getString("tool")!;
        const data = (await fetchTool(tool)) as Tool;

        const { url, name, sell, uses, customizable, availability, variations, buy } = data;
        const thumbnail = variations.random().image_url;

        const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
            .setURL(url)
            .setAuthor({ name, iconURL: thumbnail, url })
            .setDescription(`More information about the ${name} can be found [here](${url} "${name}").`)
            .setThumbnail(thumbnail)
            .addFields(
                { name: "**Sell Price**", value: client.utils.formatNumber(sell), inline: true },
                { name: "**Uses**", value: `${uses}`, inline: true },
                { name: "**Customizable**", value: customizable ? "Yes" : "No", inline: true },
                {
                    name: "**Availability**",
                    value: `${availability.map((avail: { from: string }) => `${avail.from}`).join("\n")}`,
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
                value: `${buy.map((b: { price: number; currency: string }) => `${client.utils.formatNumber(b.price)} ${b.currency}`).join("\n")}`,
                inline: true
            });
        }

        if (variations.length > 1) {
            msgEmbed.addFields({
                name: `**Variations [${variations.length}]**`,
                value: `${variations.map((v: { variation: string }) => `${v.variation}`).join(", ")}`,
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
};

const fetchTool = async (name: string) => {
    const resp = await axios.get(`https://api.nookipedia.com/nh/tools/${encodeURIComponent(name.toLowerCase())}`, {
        headers: {
            "X-API-KEY": `${process.env.NOOK_API_KEY}`,
            "Accept-Version": "2.0.0"
        }
    });
    return resp.data;
};
