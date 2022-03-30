import { ApplicationCommandData, ApplicationCommandManager, Client, ClientOptions, Collection, ColorResolvable } from "discord.js";
import { connect } from "mongoose";
import { Guild } from "../types/guild";
import { Profile } from "../types/profile";
import { KelleeBotCommand } from "../util/command";
import { Manager } from "./manager";
import { registerCommands, registerEvents, registerFeatures } from "./registry";
import GuildModel from "../schemas/guild";
import ProfileModel from "../schemas/profile";
import { Utils } from "../util/utils";

import ConfigJson from "../../config/config.json";
import LanguageJson from "../../config/languages.json";
import ColorsJson from "../../config/colors.json";

declare interface Config {
  TOKEN: string;
  MONGODB_URI: string;
  DEVS: string[];
  TEST_SERVERS: string[];
  giveawayReactEmoji: string;
  defaultRafflePoints: number;
  pointsToGive: number;
  monthlyPrize: string;
  timeZone: string;
}

class KelleeBotClient extends Client {
  commands: Collection<string, KelleeBotCommand>;
  categories: Collection<string, string[]>;
  guildInfo: Manager<string, Guild>;
  profileInfo: Manager<string, Profile>;
  config: Config;
  colors: { [x: string]: ColorResolvable };
  languages: { [x: string]: any };
  utils: Utils;
  serverCooldowns: Collection<string, Collection<string, Collection<string, number>>>;
  globalCooldowns: Collection<string, Collection<string, number>>;

  constructor(options: ClientOptions) {
    super(options);

    this.commands = new Collection();
    this.categories = new Collection();

    this.guildInfo = new Manager(this, GuildModel);
    this.profileInfo = new Manager(this, ProfileModel);
    //@ts-ignore
    this.utils = new Utils(this);

    this.config = ConfigJson;
    //@ts-ignore
    this.colors = ColorsJson;
    this.languages = LanguageJson;

    this.serverCooldowns = new Collection();
    this.globalCooldowns = new Collection();
  }

  async loadCommands() {
    if (!this.application?.owner) await this.application?.fetch();

    await registerCommands(this, '../commands');

    const guildCommands = toApplicationCommand(this.commands.filter(s => s.development));
    const globalCommands = toApplicationCommand(this.commands.filter(s => !s.development));
    const devOnly = this.commands.filter(s => s.devOnly);

    if (guildCommands.length) {
      const guild = await this.guilds.fetch(this.config.TEST_SERVERS[0]);
      this.utils.log("SUCCESS", `${__filename}`, "Guild commands:");
      //@ts-ignore
      await saveCommands(this, guild.commands, guildCommands);
    }

    if (globalCommands.length) {
      this.utils.log("SUCCESS", `${__filename}`, "Global commands:")
      await saveCommands(this, this.application!.commands, globalCommands);
    }

    if (devOnly.size) {
      const guild = await this.guilds.fetch(this.config.TEST_SERVERS[0]);

      for (const [name, command] of devOnly) {
        if (command.development) {
          await guild.commands.cache.find(c => c.name === command.name)!.permissions.set({ permissions: this.config.DEVS.map(id => { return { id, type: "USER", permission: true } }) });
        }
      }
    }
  }

  async loadEvents() {
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
      this.utils.log("WARNING", `${__filename}`, "Connecting to the database...");
      await connect(`${process.env.MONGO_PATH}`);
      this.utils.log("SUCCESS", `${__filename}`, "Connected to the database!");
    } catch (e: any) {
      this.utils.log("ERROR", `${__filename}`, `Error connecting to the database: ${e.message}`);
      process.exit(1);
    }

    try {
      this.utils.log("WARNING", `${__filename}`, "Loading events...");
      await this.loadEvents();
      this.utils.log("SUCCESS", `${__filename}`, "Loaded all events!");
    } catch (e: any) {
      this.utils.log("ERROR", `${__filename}`, `Error loading events: ${e.message}`);
    }

    try {
      this.utils.log("WARNING", `${__filename}`, "Logging in...");
      await super.login(token);
      this.user!.setActivity("everything will be okellee 💓");
      this.utils.log("SUCCESS", `${__filename}`, `Logged in as ${this.user!.tag}`);
    } catch (e: any) {
      this.utils.log("ERROR", `${__filename}`, `Error logging in: ${e.message}`);
      process.exit(1);
    }

    try {
      this.utils.log("WARNING", `${__filename}`, "Loading commands...");
      await this.loadCommands();
      this.utils.log("SUCCESS", `${__filename}`, "Loaded all commands!");
    } catch (e: any) {
      this.utils.log("ERROR", `${__filename}`, `Error loading commands: ${e.message}`);
    }

    try {
      this.utils.log("WARNING", `${__filename}`, `Loading features...`);
      await this.loadFeatures();
      this.utils.log("SUCCESS", `${__filename}`, "Loaded all features!");
    } catch (e: any) {
      this.utils.log("ERROR", `${__filename}`, `Error loading features: ${e.message}`);
    }

    return this.token!;
  }
}

export { KelleeBotClient };

function toApplicationCommand(collection: Collection<string, KelleeBotCommand>): ApplicationCommandData[] {
  return collection.map(s => { return { name: s.name, description: s.description, options: s.options, defaultPermission: s.devOnly ? false : s.defaultPermission } });
}

async function saveCommands(client: KelleeBotClient, manager: ApplicationCommandManager, commands: ApplicationCommandData[]) {
  const existingCommands = await manager.fetch();

  const newCommands = commands.filter(c => !existingCommands.find(e => e.name === c.name));
  const deletedCommands = existingCommands.filter(c => !commands.find(e => e.name === c.name));
  const editedCommands = commands.filter(c => {
    const command = existingCommands.find(e => e.name === c.name);
    if (!command) return false;
    return !command.equals(c, true);
  });

  client.utils.log("SUCCESS", `${__filename}`, `Total commands   - ${commands.length}`);
  client.utils.log("SUCCESS", `${__filename}`, `New commands     - ${newCommands.length}`);
  client.utils.log("SUCCESS", `${__filename}`, `Deleted commands - ${deletedCommands.size}`);
  client.utils.log("SUCCESS", `${__filename}`, `Edited commands  - ${editedCommands.length}`);

  for (const command of newCommands) {
    await manager.create(command);
  }

  for (const [id, command] of deletedCommands) {
    await manager.delete(id);
  }

  for (const command of editedCommands) {
    await manager.edit(existingCommands.find(c => c.name === command.name)!.id, command);
  }
}