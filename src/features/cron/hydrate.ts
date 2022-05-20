import { Client } from "../../util/client";
import { timeZone } from "../../../config/config.json";
import cron from "cron";
import { TextChannel } from "discord.js";

const hydrate = [
    "It's time to {0} or die-drate!",
    "Don't forget to {0}!",
    "It's time to {0}!",
    "Remember to {0}!",
    "Stay moist and {0}!"
];

export default (client: Client) => {
    new cron.CronJob("00 */30 9-22 * * *", () => execute(client), null, true, timeZone);
}

const execute = async (client: Client) => {
    try {
        const guildID = "844747196745383956";
        const channelID = "845444566823731220";
        const hydrateRoleID = "976900199324729374";

        const guild = client.guilds.cache.get(guildID);
        if (!guild) return;

        const channel = guild.channels.cache.get(channelID) as TextChannel;
        if (!channel) return;

        const hydrateMessage = hydrate.random().format(`<@&${hydrateRoleID}>`);
        await channel.send({ content: hydrateMessage, allowedMentions: { parse: ["roles"] } });
    } catch (e: any) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e.message}`);
    }
}