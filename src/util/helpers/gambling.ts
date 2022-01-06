import { Snowflake } from "discord.js";
import gambling from "../../schemas/gambling";

const pointsCache = {} as { [key: string]: number }

export const addPoints = async (guildID: Snowflake, userID: Snowflake, points: number) => {
    const result = await gambling.findOneAndUpdate(
        { guildID, userID },
        {
            guildID,
            userID,
            $inc: { points }
        },
        { new: true, upsert: true }
    )
    pointsCache[`${guildID}-${userID}`] = result.points
    return result.points
}