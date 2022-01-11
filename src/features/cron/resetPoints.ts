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
    try {
        const guildID = "707103910686621758"; // Lunar Circle
        const guild = client.guilds.cache.get(guildID);
        if (!guild) return;

        const results = await gambling.find({ guildID });
        if (!results) return;

        for (const result of results) {
            const { guildID, userID } = result;
            const newPoints = await setPoints(guildID, userID, 0);
            client.utils.log("WARNING", '', `${userID} ${newPoints}`);
        }
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
    }
}