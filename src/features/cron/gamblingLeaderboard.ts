import { ColorResolvable, MessageEmbed, TextChannel } from "discord.js";
import cron from "cron";
import { Client } from "../../util/client";
import { GAMBLING } from "../../../config/embedColours.json";
import { timeZone } from "../../../config/config.json";
import { Guild } from "../../types/guild";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import gambling from "../../schemas/gambling";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advanced);

export default (client: Client) => {
    new cron.CronJob(
        "00 */5 * * * *",
        () => execute(client),
        null,
        true,
        timeZone
    );
};

const execute = async (client: Client) => {
    const msgEmbed = new MessageEmbed()
        .setColor(GAMBLING as ColorResolvable)
        .setTitle("Gambling Leaderboard")
        .setThumbnail("https://i.imgur.com/VwbWTOn.png")
        .setFooter({ text: "Leaderboard last updated " })
        .setTimestamp();

    client.guilds.cache.forEach(async (guild) => {
        try {
            let guildInfo = await client.guildInfo.get(guild.id);
            if (!guildInfo.gambling) return;

            const { gamblingLeaderboardChannel } = guildInfo.gambling;
            const channel = client.channels.cache.get(gamblingLeaderboardChannel) as TextChannel;
            if (!channel) return;

            const messages = await channel.messages.fetch();
            const firstMessage = messages.first();
            const topGamblers = await fetchTopGamblers(client, guildInfo);
            msgEmbed.setDescription(topGamblers);

            if (firstMessage) await firstMessage.edit({ embeds: [msgEmbed] });
            else await channel.send({ embeds: [msgEmbed] });
        } catch (e) {
            client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        }
    });
};

const fetchTopGamblers = async (client: Client, guild: Guild) => {
    const timezoneFormat = dayjs().tz(timeZone).format("z");
    const nextMonth = dayjs().tz(timeZone).add(1, "months").format("MMMM");
    const timestamp = Math.round((new Date().getTime() + 1000 * 60 * 5) / 1000);
    let text = guild.gambling.monthlyPrize
        ? `Person with the most points at the end of each month gets a free month of *${guild.gambling.monthlyPrize}*. A winner is determined at 12AM ${timezoneFormat} on the first of every month.\n\n`
        : "Here are the top 10 gamblers with the most points:\n\n";

    const results = await gambling.find({ guildID: guild._id }).sort({ points: -1 }).limit(10);

    for (let count = 0; count < results.length; count++) {
        const { userID, points = 0 } = results[count];
        text += `${count + 1}. <@${userID}> has \`${points.toLocaleString()}\` ${client.utils.pluralize(points, "point")}.\n`;
    }
    text += guild.gambling.monthlyPrize
        ? `\nPoints will be reset back to 0 at 12AM ${timezoneFormat} on ${nextMonth} 1st.\n`
        : "\n";

    text += `\nLeaderboard will update <t:${timestamp}:R>.\n`;
    return text;
}