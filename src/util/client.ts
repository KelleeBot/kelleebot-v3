import { ClientOptions, Collection, Snowflake } from "discord.js";
import TwitchApi from "node-twitch";
import { KelleeBotClient } from "../prefab/client";
import { Manager } from "../prefab/manager";
import TwitchLiveModel from "../schemas/twitchLive";
import { TwitchLive } from "../types/twitchLive"
import { MovieDb } from "moviedb-promise";

class Client extends KelleeBotClient {
  twitchLiveInfo: Manager<string, TwitchLive>;
  twitchApi: TwitchApi;
  movieDb: MovieDb;

  constructor(options: ClientOptions) {
    super(options);

    this.twitchLiveInfo = new Manager(this, TwitchLiveModel)
    this.twitchApi = new TwitchApi({
      client_id: `${process.env.TWITCH_CLIENT_ID}`,
      client_secret: `${process.env.TWITCH_CLIENT_SECRET}`
      // access_token: `${process.env.TWITCH_BEARER_TOKEN}`
    });
    this.movieDb = new MovieDb(`${process.env.MOVIEDB_API_KEY}`);
  }
}

export { Client };
