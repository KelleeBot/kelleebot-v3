import { Snowflake } from "discord.js";
import { KelleeBotUtils } from "../prefab/utils";
import { Client } from "./client";

class Utils extends KelleeBotUtils {
  constructor(client: Client) {
    super(client);
  }

  async getTwitchLive(client: Client, guildID: Snowflake) {
    let twitchLiveInfo = await client.twitchLiveInfo.get(guildID);
    if (!twitchLiveInfo) {
      await client.twitchLiveInfo.findByIdAndUpdate(
        guildID,
        {},
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }
    return twitchLiveInfo;
  }
}

export { Utils };
