import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";
import { Artwork } from "../../types/animalCrossing";

export const artwork = async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        const artwork = interaction.options.getString("artwork")!;
        const data = (await fetchArtwork(artwork)) as Artwork;

        const { url, name, image_url, buy, sell, has_fake, authenticity } = data;

        const msgEmbed = (await client.utils.CustomEmbed({ userID: interaction.user.id }))
            .setURL(url)
            .setAuthor({ name, iconURL: image_url, url })
            .setDescription(`More info about the ${name} can be found [here](${url} "${name}").`)
            .setThumbnail(image_url)
            .addFields(
                {
                    name: "**Buy Price**",
                    value: client.utils.formatNumber(buy),
                    inline: true
                },
                {
                    name: "**Sell Price**",
                    value: client.utils.formatNumber(sell),
                    inline: true
                },
                {
                    name: "**Has Fake**",
                    value: has_fake ? "Yes" : "No",
                    inline: true
                },
                {
                    name: "**Authenticity**",
                    value: authenticity ? authenticity : "This artwork is always genuine.",
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
};

const fetchArtwork = async (name: string) => {
    const resp = await axios.get(`https://api.nookipedia.com/nh/art/${encodeURIComponent(name.toLowerCase())}`, {
        headers: {
            "X-API-KEY": `${process.env.NOOK_API_KEY}`,
            "Accept-Version": "2.0.0"
        }
    });
    return resp.data;
};
