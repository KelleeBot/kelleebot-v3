import { Client } from "../../util/client";
import { MessageEmbed, TextChannel } from "discord.js";
import cron from "cron";
import { timeZone } from "../../../config/config.json";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advanced);

const schedule = {
    Monday: "OFF",
    Tuesday: "Taco Tuesday (Stream with <@274641094484951040>)! [7:00PM]",
    Wednesday: "OFF",
    Thursday: "Teyvat Thursday! (Cozy Grove) [7:00PM]",
    Friday: "OFF",
    Saturday: "OFF",
    Sunday: "OFF"
} as { [key: string]: string };

export default (client: Client) => {
    new cron.CronJob("00 00 00 * * *", () => execute(client), null, true, timeZone);
};

const execute = async (client: Client) => {
    try {
        const channelID = "815426698555949056"; // #schedule channel
        const timezoneFormat = dayjs().tz(timeZone).format("z");
        const today = dayjs().tz(timeZone).format("dddd"); // Get what day of the week today is in eastern time

        let text = `Below, you will find Kéllee's weekly streaming schedule. All times listed below are in ${timezoneFormat} and are subject to change without notice.\n\n`;
        for (const key in schedule) {
            text += key.toLowerCase() === today.toLowerCase() ? `**${key}: ${schedule[key]}**\n` : `${key}: ${schedule[key]}\n`;
        }
        text += `\nThere could be occassional surprise streams too! Pay attention to the <#724484131643457650> channel for updates and don't forget to assign yourself the <@&732780296986034287> role in the <#732786545169399838> channel to get notified for whenever Kéllee goes live!`;

        const msgEmbed = new MessageEmbed()
            .setTitle("Weekly Schedule")
            .setThumbnail("https://i.imgur.com/rJQgRC3.png")
            .setColor("#ecc5ff")
            .setDescription(text);

        const channel = client.channels.cache.get(channelID) as TextChannel;
        if (!channel) return;

        const messages = await channel.messages.fetch();
        const firstMessage = messages.first();

        if (firstMessage) await firstMessage.edit({ embeds: [msgEmbed] });
        else await channel.send({ embeds: [msgEmbed] });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
    }
};
