import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";
import { Bug } from "../../types/animalCrossing";

export const bug = async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        const bug = interaction.options.getString("bug")!;
        const data = await fetchBug(bug) as Bug;

        const { url, name, image_url, sell_nook, sell_flick, location, north, south } = data;

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
                    name: "**Flick Price**",
                    value: client.utils.formatNumber(sell_flick),
                    inline: true
                },
                {
                    name: "**Location**",
                    value: location,
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
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.editReply({
            content: "An error has occurred. Please try again."
        });
    }
}

const fetchBug = async (name: string) => {
    const resp = await axios.get(
        `https://api.nookipedia.com/nh/bugs/${encodeURIComponent(name.toLowerCase())}`,
        {
            headers: {
                "X-API-KEY": `${process.env.NOOK_API_KEY}`,
                "Accept-Version": "2.0.0"
            }
        }
    );
    return resp.data;
};