import cron from "cron";
import { timeZone } from "../../../config/config.json";
import gambling from "../../schemas/gambling";
import { Client } from "../../util/client";
import { setPoints } from "../../util";

export default (client: Client) => {
    new cron.CronJob(
        "05 00 00 1 * *",
        () => execute(client),
        null,
        true,
        timeZone
    );
};

const execute = async (client: Client) => {
    client.guilds.cache.forEach(async (guild) => {
        try {
            const guildInfo = await client.guildInfo.get(guild.id);
            if (!guildInfo) return;

            const { resetPointsMonthly } = guildInfo.gambling;
            if (!resetPointsMonthly) return;

            const results = await gambling.find({ guildID: guild.id });
            if (!results || !results.length) return;

            for (const result of results) {
                const { guildID, userID } = result;
                const newPoints = await setPoints(guildID, userID, 0);
                client.utils.log("WARNING", `${guild.name}`, `${userID} ${newPoints}`);
            }
        } catch (e) {
            client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        }
    });
}