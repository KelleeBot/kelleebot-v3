import { Snowflake } from "discord.js";

export interface TwitchLive {
    // Guild ID
    _id: string;
    messageID: Snowflake;
    liveChannels: string[];
}
