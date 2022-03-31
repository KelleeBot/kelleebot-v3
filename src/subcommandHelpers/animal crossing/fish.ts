import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";
import { Fish } from "../../types/animalCrossing";

export const fish = async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        const fishName = interaction.options.getString("fish")!;
        const data = await fetchFish(fishName) as Fish;

        const { url, name, image_url, sell_nook, sell_cj, location, shadow_size, north, south } = data;

        const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
            .setURL(url)
            .setAuthor({ name, iconURL: image_url, url })
            .setDescription(`More information about the ${name} can be found [here](${url} "${name}").`)
            .setThumbnail(image_url)
            .addFields(
                {
                    name: "**Price**",
                    value: client.utils.formatNumber(sell_nook),
                    inline: true
                },
                {
                    name: "**CJ Price**",
                    value: client.utils.formatNumber(sell_cj),
                    inline: true
                },
                {
                    name: "**Location**",
                    value: location,
                    inline: true
                },
                {
                    name: "**Shadow Size**",
                    value: shadow_size,
                    inline: true
                },
                {
                    name: "**Months Available**",
                    value: `North:\n${north.availability_array.map(
                        (avail: { months: string }) => `${avail.months}\n`
                    )}\nSouth:\n${south.availability_array.map(
                        (avail: { months: string }) => `${avail.months}\n`
                    )}`,
                    inline: true
                },
                {
                    name: "**Times Available**",
                    value: `North:\n${north.availability_array.map(
                        (avail: { time: string }) => `${avail.time}\n`
                    )}\nSouth:\n${south.availability_array.map(
                        (avail: { time: string }) => `${avail.time}\n`
                    )}`,
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

const fetchFish = async (name: string) => {
    const resp = await axios.get(
        `https://api.nookipedia.com/nh/fish/${encodeURIComponent(name.toLowerCase())}`,
        {
            headers: {
                "X-API-KEY": `${process.env.NOOK_API_KEY}`,
                "Accept-Version": "2.0.0"
            }
        }
    );
    return resp.data;
}