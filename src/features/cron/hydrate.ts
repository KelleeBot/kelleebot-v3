import { Client } from "../../util/client";
import { timeZone } from "../../../config/config.json";
import cron from "cron";
import { TextChannel } from "discord.js";

const hydrate = [
    "It's time to {0} or die-drate!",
    "Don't forget to {0}!",
    "It's time to {0}!",
    "Remember to {0}!",
    "Stay moist and {0}!",
    "{0} yourself now!",
    "Time to drink some water and {0}!"
];

export default (client: Client) => {
    new cron.CronJob("00 */30 9-22 * * *", () => execute(client), null, true, timeZone);
}

const execute = async (client: Client) => {
    try {
        const channelID = "977014276243988520";
        const hydrateRoleID = "976900199324729374";

        const channel = client.channels.cache.get(channelID) as TextChannel;
        if (!channel) return;

        const hydrateMessage = hydrate.random().format(`<@&${hydrateRoleID}>`);
        await channel.send({ content: hydrateMessage, allowedMentions: { parse: ["roles"] } });
    } catch (e: any) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e.message}`);
    }
}