import { Snowflake } from "discord.js";
import gambling from "../../schemas/gambling";

const pointsCache = {} as { [key: string]: number };

export const addPoints = async (guildID: Snowflake, userID: Snowflake, points: number) => {
    const result = await gambling.findOneAndUpdate(
        { guildID, userID },
        {
            guildID,
            userID,
            $inc: { points }
        },
        { new: true, upsert: true }
    );
    pointsCache[`${guildID}-${userID}`] = result.points;
    return result.points;
};

export const setPoints = async (guildID: Snowflake, userID: Snowflake, points: number) => {
    const result = await gambling.findOneAndUpdate(
        { guildID, userID },
        {
            guildID,
            userID,
            $set: { points }
        },
        { new: true, upsert: true }
    );
    pointsCache[`${guildID}-${userID}`] = result.points;
    return result.points;
};

export const getPoints = async (guildID: Snowflake, userID: Snowflake) => {
    const cachedValue = pointsCache[`${guildID}-${userID}`];
    if (cachedValue) return cachedValue;

    const result = await gambling.findOne({ guildID, userID });

    let points = 0;
    if (result) {
        points = result.points;
    } else {
        await new gambling({
            guildID,
            userID,
            points
        }).save();
    }
    pointsCache[`${guildID}-${userID}`] = points;
    return points;
};
