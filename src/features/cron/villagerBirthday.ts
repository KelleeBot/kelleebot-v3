import cron from "cron";
import axios from "axios";
import { DateTime } from "luxon";
import { MessageEmbed, TextChannel } from "discord.js";
import { Client } from "../../util/client";
import { Villagers } from "../../types/animalCrossing";

export default (client: Client) => {
    new cron.CronJob(
        "00 00 08 * * *",
        () => { execute(client) },
        null,
        true,
        "America/Denver"
    );
};

const execute = async (client: Client) => {
    const currentMonth = DateTime.now().month;
    const currentDay = DateTime.now().day;

    const channel = client.channels.cache.get("754196934985646171") as TextChannel;
    if (!channel) return;

    try {
        const resp = await axios.get(`https://api.nookipedia.com/villagers?birthmonth=${encodeURIComponent(currentMonth)}&birthday=${encodeURIComponent(currentDay)}&nhdetails=true`,
            {
                headers: {
                    "X-API-KEY": `${process.env.NOOK_API_KEY}`,
                    "Accept-Version": "2.0.0"
                }
            }
        );
        const { data } = resp;
        if (!data.length) return;

        const text = `Happy birthday to ${data.map((villager: Villagers) => villager.name).join(" and ")}! 🎉`;
        if (data.length > 1) {
            const embedArray = [];
            for (let i = 0; i < data.length; i++) {
                let msgEmbed = createEmbed(data[i]);
                embedArray.push(msgEmbed);
            }
            channel.send({ content: text, embeds: embedArray });
        } else {
            const msgEmbed = createEmbed(data[0]);
            channel.send({ content: text, embeds: [msgEmbed] });
        }
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
    }
};

const createEmbed = (data: Villagers) => {
    const msgEmbed = new MessageEmbed()
        .setColor(data.title_color ? `#${data.title_color}` : "ORANGE")
        .setURL(data.url)
        .setAuthor({
            name: data.name,
            iconURL: !data.nh_details
                ? `${data.image_url}`
                : `${data.nh_details.icon_url}`,
            url: data.url
        })
        .setDescription(`More info about ${data.name} can be found [here](${data.url} "${data.name}").`)
        .setThumbnail(data.image_url)
        .addFields(
            {
                name: "**Species**",
                value: data.species,
                inline: true
            },
            {
                name: "**Personality**",
                value: data.personality,
                inline: true
            },
            {
                name: "**Gender**",
                value: data.gender,
                inline: true
            },
            {
                name: "**Catchphrase**",
                value: data.phrase,
                inline: true
            },
            {
                name: "**Birthday**",
                value: `${data.birthday_month} ${data.birthday_day}`,
                inline: true
            },
            {
                name: "**Sign**",
                value: data.sign,
                inline: true
            }
        )
        .setFooter({
            text: "Powered by Nookipedia",
            iconURL: "https://nookipedia.com/wikilogo.png"
        });
    return msgEmbed;
};
