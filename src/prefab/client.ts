import {
  ApplicationCommandData,
  Client,
  ClientOptions,
  Collection,
  ColorResolvable
} from "discord.js";
import { connect } from "mongoose";
import { Guild } from "../types/guild";
import { Profile } from "../types/profile";
import { KelleeBotCommand } from "../util/command";
import { Manager } from "./manager";
import { registerCommands, registerEvents, registerFeatures } from "./registry";
import GuildModel from "../schemas/guild";
import ProfileModel from "../schemas/profile";
import { Utils } from "../util/utils";

class KelleeBotClient extends Client {
  commands: Collection<string, KelleeBotCommand>;
  categories: Collection<string, string[]>;
  guildInfo: Manager<string, Guild>;
  profileInfo: Manager<string, Profile>;
  config: Config;
  colors: { [x: string]: ColorResolvable };
  languages: { [x: string]: any };
  utils: Utils;
  serverCooldowns: Collection<
    string,
    Collection<string, Collection<string, number>>
  >;
  globalCooldowns: Collection<string, Collection<string, number>>;

  constructor(options: ClientOptions) {
    super(options);

    this.commands = new Collection();
    this.categories = new Collection();

    //@ts-ignore
    this.guildInfo = new Manager(this, GuildModel);
    //@ts-ignore
    this.profileInfo = new Manager(this, ProfileModel);
    //@ts-ignore
    this.utils = new Utils(this);

    this.config = require("../config/config.json");
    this.colors = require("../config/colors.json");
    this.languages = require("../config/languages.json");

    this.serverCooldowns = new Collection();
    this.globalCooldowns = new Collection();
  }

  async loadCommands() {
    if (!this.application?.owner) await this.application?.fetch();

    //@ts-ignore
    await registerCommands(this, "../commands");

    const guildCommands = toApplicationCommand(
      this.commands.filter((s) => s.development)
    );
    const globalCommands = toApplicationCommand(
      this.commands.filter((s) => !s.development)
    );

    if (guildCommands.length) {
      const guild = await this.guilds.fetch(this.config.testServers[0]);
      await guild.commands.set(guildCommands);
    }

    if (globalCommands.length)
      await this.application!.commands.set(globalCommands);

    const devOnly = this.commands.filter((s) => s.devOnly).values();
    for (const command of devOnly) {
      if (command.development) {
        const guild = await this.guilds.fetch(this.config.testServers[0]);
        await guild.commands.cache
          .find((c) => c.name === command.name)!
          .permissions.set({
            permissions: this.config.devs.map((id) => {
              return { id, type: "USER", permission: true };
            })
          });
      }
    }
  }

  async loadEvents() {
    //@ts-ignore
    await registerEvents(this, "../events");
  }

  async loadFeatures() {
    //@ts-ignore
    await registerFeatures(this, "../features");
  }

  /**
   * @param {string} token
   * @returns
   */
  async login(token?: string) {
    try {
      this.utils.log(
        "WARNING",
        `${__filename}`,
        "Connecting to the database..."
      );
      await connect(`${process.env.MONGO_PATH}`);
      this.utils.log("SUCCESS", `${__filename}`, "Connected to the database!");
    } catch (e) {
      this.utils.log(
        "ERROR",
        `${__filename}`,
        `Error connecting to the database: ${e}`
      );
      process.exit(1);
    }

    try {
      this.utils.log("WARNING", `${__filename}`, "Loading events...");
      await this.loadEvents();
      this.utils.log("SUCCESS", `${__filename}`, "Loaded all events!");
    } catch (e) {
      this.utils.log("ERROR", `${__filename}`, `Error loading events: ${e}`);
    }

    try {
      this.utils.log("WARNING", `${__filename}`, `Loading features...`);
      await this.loadFeatures();
      this.utils.log("SUCCESS", `${__filename}`, "Loaded all features!");
    } catch (e) {
      this.utils.log("ERROR", `${__filename}`, `Error loading features: ${e}`);
    }

    try {
      this.utils.log("WARNING", `${__filename}`, "Logging in...");
      await super.login(token);
      this.utils.log(
        "SUCCESS",
        `${__filename}`,
        `Logged in as ${this.user!.tag}`
      );
    } catch (e) {
      this.utils.log("ERROR", `${__filename}`, `Error logging in: ${e}`);
      process.exit(1);
    }

    try {
      this.utils.log("WARNING", `${__filename}`, "Loading commands...");
      await this.loadCommands();
      this.utils.log("SUCCESS", `${__filename}`, "Loaded all commands!");
    } catch (e) {
      this.utils.log("ERROR", `${__filename}`, `Error loading commands: ${e}`);
    }

    return this.token!;
  }
}

export { KelleeBotClient };

function toApplicationCommand(
  collection: Collection<string, KelleeBotCommand>
): ApplicationCommandData[] {
  return collection.map((s) => {
    return {
      name: s.name,
      description: s.description,
      options: s.options,
      defaultPermission: s.devOnly ? false : s.defaultPermission
    };
  });
}

declare interface Config {
  devs: string[];
  testServers: string[];
}
