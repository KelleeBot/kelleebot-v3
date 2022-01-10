import { ClientOptions } from "discord.js";
import TwitchApi from "node-twitch";
import { KelleeBotClient } from "../prefab/client";
import { Manager } from "../prefab/manager";
import TwitchLiveModel from "../schemas/twitchLive";
import { TwitchLive } from "../types/twitchLive"
import { MovieDb } from "moviedb-promise";
import Twitter from "twitter-lite";
import { GiveawaysManager } from "discord-giveaways";
import { giveawayReactEmoji } from "../../config/config.json"

class Client extends KelleeBotClient {
  twitchLiveInfo: Manager<string, TwitchLive>;
  twitchApi: TwitchApi;
  movieDb: MovieDb;
  twitter: Twitter;
  giveaways: GiveawaysManager;

  constructor(options: ClientOptions) {
    super(options);

    this.twitchLiveInfo = new Manager(this, TwitchLiveModel)
    this.twitchApi = new TwitchApi({
      client_id: `${process.env.TWITCH_CLIENT_ID}`,
      client_secret: `${process.env.TWITCH_CLIENT_SECRET}`
      // access_token: `${process.env.TWITCH_BEARER_TOKEN}`
    });
    this.movieDb = new MovieDb(`${process.env.MOVIEDB_API_KEY}`);
    this.twitter = new Twitter({
      consumer_key: `${process.env.TWITTER_API_KEY}`,
      consumer_secret: `${process.env.TWITTER_API_KEY_SECRET}`,
      access_token_key: `${process.env.TWITTER_ACCESS_TOKEN}`,
      access_token_secret: `${process.env.TWITTER_ACCESS_TOKEN_SECRET}`
    });
    this.giveaways = new GiveawaysManager(this, {
      storage: "./giveaways.json",
      default: {
        botsCanWin: false,
        exemptPermissions: ["ADMINISTRATOR"],
        embedColor: "#FF0000",
        reaction: giveawayReactEmoji
      }
    })
  }
}

export { Client };
