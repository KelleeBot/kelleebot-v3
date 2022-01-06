import { ClientOptions, Collection, Snowflake } from "discord.js";
import { KelleeBotClient } from "../prefab/client";
import { TwitchLive } from "../types/twitchLive"

class Client extends KelleeBotClient {
  twitchLiveCache: Collection<Snowflake, TwitchLive>
  constructor(options: ClientOptions) {
    super(options);

    this.twitchLiveCache = new Collection();
  }
}

export { Client };
