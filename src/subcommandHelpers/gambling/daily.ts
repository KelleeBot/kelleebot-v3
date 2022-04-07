import dailyRewards from "../../schemas/dailyRewards";
import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { addPoints } from "../../util";
import { ALREADY_CLAIMED, CLAIMED } from "../../../config/messages.json";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";

dayjs.extend(utc);
dayjs.extend(duration);

let claimedCache: any[] = [];

const clearCache = () => {
    claimedCache = [];
    setTimeout(clearCache, 1000 * 60 * 10); // Clear the cache every 10 mins
};
clearCache();

export const daily = async (client: Client, interaction: CommandInteraction) => {
    const { guild, user } = interaction;
    const guildInfo = await client.guildInfo.get(guild!.id);
    if (guildInfo.gambling) {
        const { dailyReward } = guildInfo.gambling;

        const inCache = claimedCache.find((cache) => cache.userID == user.id && cache.guildID == guild!.id);
        const index = claimedCache.findIndex((cache) => cache.userID == user.id && cache.guildID == guild!.id);

        if (inCache) {
            if (getHours(claimedCache[index].updatedAt) == 24) {
                claimedCache.splice(index, 1); // Remove from cache if time expired before the cache can be cleared
            } else {
                client.utils.log("WARNING", `${__filename}`, `Daily command - Returning from cache (${interaction.user.tag})`);
                const remaining = getTimeRemaining(claimedCache[index].updatedAt);
                const alreadyClaimed = ALREADY_CLAIMED.replace(/{REMAINING}/g, remaining);
                return interaction.reply({ content: alreadyClaimed });
            }
        }

        client.utils.log("WARNING", `${__filename}`, `Daily command - Fetching from Mongo (${interaction.user.tag})`);
        const obj = {
            guildID: guild!.id,
            userID: user.id
        };

        const results = await dailyRewards.findOne(obj);
        const updatedAt = results ? results.updatedAt : dayjs.utc();
        if (results) {
            const remaining = getTimeRemaining(updatedAt);
            if (getHours(updatedAt) < 24) {
                claimedCache.push({
                    guildID: guild!.id,
                    userID: user.id,
                    updatedAt
                });
                const alreadyClaimed = ALREADY_CLAIMED.replace(/{REMAINING}/g, remaining);
                return interaction.reply({ content: alreadyClaimed });
            }
        }

        await dailyRewards.findOneAndUpdate(obj, obj, { upsert: true });
        claimedCache.push({
            guildID: guild!.id,
            userID: user.id,
            updatedAt: dayjs.utc()
        });

        const claimed = CLAIMED.replace(/{DAILY}/g, client.utils.formatNumber(dailyReward));
        await addPoints(guild!.id, user.id, dailyReward);
        return interaction.reply({ content: claimed });
    }
};

const getTimeRemaining = (updatedAt: Date) => {
    const thenUTC = dayjs.utc(updatedAt);
    const nowUTC = dayjs.utc();

    const oneDay = thenUTC.add(1, "days");
    const timeRemaining = oneDay.diff(nowUTC);
    const duration = dayjs.duration(timeRemaining);

    const hoursDuration = duration.hours();
    const minsDuration = duration.minutes();
    const secsDuration = duration.seconds();

    const hoursText = hoursDuration !== 1 ? "hours" : "hour";
    const minsText = minsDuration !== 1 ? "minutes" : "minute";
    const secsText = secsDuration !== 1 ? "seconds" : "second";

    if (hoursDuration === 0 && minsDuration === 0) {
        return `**${secsDuration} ${secsText}**.`;
    } else if (hoursDuration === 0) {
        return `**${minsDuration} ${minsText} and ${secsDuration} ${secsText}**.`;
    } else {
        return `**${hoursDuration} ${hoursText}, ${minsDuration} ${minsText}, and ${secsDuration} ${secsText}**.`;
    }
};

const getHours = (updatedAt: Date) => {
    const thenUTC = dayjs.utc(updatedAt);
    const nowUTC = dayjs.utc();
    return nowUTC.diff(thenUTC, "hours");
};
