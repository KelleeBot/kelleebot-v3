import cron from "cron";
import { Snowflake, TextChannel } from "discord.js";
import { google, youtube_v3 } from "googleapis";
import { Client } from "../../util/client";
import youtubeNotifications from "../../schemas/youtubeNotifications";

export default async (client: Client) => {
    new cron.CronJob(
        "00 */15 * * * *",
        () => execute(client),
        null,
        true,
        "America/Denver"
    );
};

const execute = async (client: Client) => {
    const guildID = "678442760092647454"; // Ramen's discord
    const channelID = "954453689404383312"; // #announcements channel
    try {
        const resp = await google.youtube("v3").search.list({
            key: process.env.YOUTUBE_API_KEY,
            channelId: process.env.YOUTUBE_CHANNEL,
            part: ["snippet"],
            order: "date"
        });

        const { data } = resp;
        const channel = client.channels.cache.get(channelID) as TextChannel;
        for (const item of data.items!.reverse()) {
            if (item.id!.kind !== "youtube#channel") {
                const data = await youtubeNotifications.find({ videoID: item.id!.videoId, guildID });
                if (!data.length) {
                    sendMessage(client, item, channel, guildID);
                }
            }
        }
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
    }
};

const sendMessage = async (client: Client, item: youtube_v3.Schema$SearchResult, channel: TextChannel, guildID?: Snowflake) => {
    try {
        await youtubeNotifications.findOneAndUpdate(
            { videoID: item.id!.videoId, guildID },
            { videoID: item.id!.videoId, guildID },
            { upsert: true }
        );

        const url = `https://www.youtube.com/watch?v=${item.id!.videoId}`;
        await channel.send({
            content: `Ayo <@&954446977758793780>! Looks like RamenBomber just dropped another banger of a video! Let's go check it out! ${url}`,
            allowedMentions: { parse: ["roles"] }
        });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
    }
};