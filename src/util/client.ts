import axios from "axios";
import { GiveawaysManager } from "discord-giveaways";
import { Player } from "discord-player";
import { ClientOptions } from "discord.js";
import { MovieDb } from "moviedb-promise";
import TwitchApi from "node-twitch";
import Twitter from "twitter-lite";

import { giveawayReactEmoji } from "../../config/config.json";
import { KelleeBotClient } from "../prefab/client";
import { Manager } from "../prefab/manager";
import ScamLinks from "../schemas/scamLinks";
import TwitchLiveModel from "../schemas/twitchLive";
import { Scams } from "../types/scams";
import { TwitchLive } from "../types/twitchLive";

class Client extends KelleeBotClient {
  twitchLiveInfo: Manager<string, TwitchLive>;
  twitchApi: TwitchApi;
  movieDb: MovieDb;
  twitter: Twitter;
  giveaways: GiveawaysManager;
  player: Player;
  scams: Manager<string, Scams>;

  artworks: Array<string>;
  bugs: Array<string>;
  clothings: Array<string>;
  diys: Array<string>;
  fishes: Array<string>;
  furnitures: Array<string>;
  interiors: Array<string>;
  item: Array<string>;
  photos: Array<string>;
  sea: Array<string>;
  tools: Array<string>;
  villager: Array<string>;

  country: Array<string>;

  pokemon: Array<string>;

  constructor(options: ClientOptions) {
    super(options);

    this.twitchLiveInfo = new Manager(this, TwitchLiveModel);
    this.twitchApi = new TwitchApi({
      client_id: `${process.env.TWITCH_CLIENT_ID}`,
      client_secret: `${process.env.TWITCH_CLIENT_SECRET}`,
      refresh_token: `${process.env.TWITCH_REFRESH_TOKEN}`
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
        embedColorEnd: "#36393f",
        reaction: giveawayReactEmoji
      }
    });
    this.player = new Player(this);
    this.scams = new Manager(this, ScamLinks);

    // Animal Crossing auto complete data
    this.artworks = new Array();
    this.bugs = new Array();
    this.clothings = new Array();
    this.diys = new Array();
    this.fishes = new Array();
    this.furnitures = new Array();
    this.interiors = new Array();
    this.item = new Array();
    this.photos = new Array();
    this.sea = new Array();
    this.tools = new Array();
    this.villager = new Array();

    // Country command auto complete data
    this.country = new Array();

    // Pokemon auto complete data
    this.pokemon = new Array();
  }

  async loadAutocompleteOptions() {
    try {
      this.utils.log(
        "WARNING",
        `${__filename}`,
        "Loading autocomplete options..."
      );
      await loadACData(this);
      await loadCountryData(this);
      await loadPokemonData(this);
      this.utils.log(
        "SUCCESS",
        `${__filename}`,
        "Loaded all autocomplete options!"
      );
    } catch (e: any) {
      this.utils.log(
        "ERROR",
        `${__filename}`,
        `Error loading autocomplete options: ${e.message}`
      );
    }
  }
}

export { Client };

const loadACData = async (client: Client) => {
  client.artworks = await fetchACData("https://api.nookipedia.com/nh/art");
  client.bugs = await fetchACData("https://api.nookipedia.com/nh/bugs");
  client.clothings = await fetchACData(
    "https://api.nookipedia.com/nh/clothing"
  );
  client.diys = await fetchACData("https://api.nookipedia.com/nh/recipes");
  client.fishes = await fetchACData("https://api.nookipedia.com/nh/fish");
  client.furnitures = await fetchACData(
    "https://api.nookipedia.com/nh/furniture"
  );
  client.interiors = await fetchACData(
    "https://api.nookipedia.com/nh/interior"
  );
  client.item = await fetchACData("https://api.nookipedia.com/nh/items");
  client.photos = await fetchACData("https://api.nookipedia.com/nh/photos");
  client.sea = await fetchACData("https://api.nookipedia.com/nh/sea");
  client.tools = await fetchACData("https://api.nookipedia.com/nh/tools");
  client.villager = await fetchACData("https://api.nookipedia.com/villagers");
};

const loadCountryData = async (client: Client) => {
  client.country = await fetchAllCountries();
};

const loadPokemonData = async (client: Client) => {
  client.pokemon = await fetchAllPokemon();
};

const fetchACData = async (url: string) => {
  const resp = await axios.get(url, {
    headers: {
      "X-API-KEY": `${process.env.NOOK_API_KEY}`,
      "Accept-Version": "2.0.0"
    }
  });
  return resp.data.map((ac: { name: string }) => ac.name);
};

const fetchAllCountries = async () => {
  const resp = await axios.get("https://restcountries.com/v3.1/all");
  return resp.data.map((country: any) => country.name.common).sort();
};

const fetchAllPokemon = async () => {
  const resp = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=1118");
  return resp.data.results.map((poke: { name: string }) => poke.name);
};
