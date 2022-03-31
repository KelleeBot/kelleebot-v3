import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import axios from "axios";
import { MessageEmbed } from "discord.js";
import { Villagers } from "../../types/animalCrossing";

export const villager = async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply();
    try {
        const villager = interaction.options.getString("name")!;
        const data = await fetchVillagerName(villager);

        if (data.length == 1) {
            const msgEmbed = createVillagerEmbed(data[0]);
            return interaction.editReply({ embeds: [msgEmbed] });
        }

        const embedArray = [];
        for (let i = 0; i < data.length; i++) {
            const msgEmbed = createVillagerEmbed(data[i]);
            embedArray.push(msgEmbed);
        }
        return interaction.editReply({ embeds: embedArray });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.editReply({
            content: "An error has occurred. Please try again."
        });
    }
};

const fetchVillagerName = async (name: string) => {
    const resp = await axios.get(
        `https://api.nookipedia.com/villagers?name=${encodeURIComponent(
            name.toLowerCase()
        )}&nhdetails=true`,
        {
            headers: {
                "X-API-KEY": `${process.env.NOOK_API_KEY}`,
                "Accept-Version": "2.0.0"
            }
        }
    );
    return resp.data;
};

const createVillagerEmbed = (data: Villagers) => {
    const {
        title_color,
        url,
        name,
        nh_details,
        image_url,
        species,
        personality,
        gender,
        phrase,
        birthday_month,
        birthday_day,
        sign
    } = data;
    return new MessageEmbed()
        .setColor(title_color ? `#${title_color}` : "ORANGE")
        .setURL(url)
        .setAuthor({
            name,
            iconURL: nh_details ? nh_details.icon_url : image_url,
            url
        })
        .setDescription(`More info about ${name} can be found [here](${url} "${name}").`)
        .setThumbnail(image_url)
        .addFields(
            { name: "**Species**", value: species, inline: true },
            { name: "**Personality**", value: personality, inline: true },
            { name: "**Gender**", value: gender, inline: true },
            { name: "**Catchphrase**", value: phrase, inline: true },
            {
                name: "**Birthday**",
                value:
                    birthday_month === "" || birthday_day === ""
                        ? "-"
                        : `${birthday_month} ${birthday_day}`,
                inline: true
            },
            { name: "**Sign**", value: sign, inline: true }
        )
        .setFooter({
            text: "Powered by Nookipedia",
            iconURL: "https://nookipedia.com/wikilogo.png"
        });
};