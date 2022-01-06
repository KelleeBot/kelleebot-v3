import {
  PermissionString,
  Collection,
  ApplicationCommandPermissionData,
  CommandInteraction,
  ApplicationCommandOptionData,
  AutocompleteInteraction
} from "discord.js";
import { Client } from "../util/client";

class Command {
  client: Client;
  name: string;
  description: string;
  category: string;
  options: ApplicationCommandOptionData[];
  defaultPermission: boolean;
  permissions: ApplicationCommandPermissionData[];
  development: boolean;
  devOnly: boolean;
  hideCommand: boolean;
  ownerOnly: boolean;
  guildOnly: boolean;
  perms: PermissionString[];
  clientPerms: PermissionString[];
  nsfw: boolean;
  cooldown: number;
  globalCooldown: boolean;
  ignoreDisabledChannels: boolean;
  canNotDisable: boolean;
  canNotSetCooldown: boolean;
  groups: { [x: string]: SubcommandGroup } | null;
  subcommands: { [x: string]: Subcommand } | null;
  isAutocomplete: boolean;
  autocomplete: Autocomplete | null | undefined;

  constructor(
    client: Client,
    {
      name = "",
      description = "",
      category = "No category",
      options = [],
      defaultPermission = true,
      permissions = [],
      development = true,
      devOnly = false,
      hideCommand = false,
      ownerOnly = false,
      guildOnly = true,
      perms = [],
      clientPerms = [],
      nsfw = false,
      cooldown = 0,
      globalCooldown = true,
      ignoreDisabledChannels = false,
      canNotDisable = false,
      canNotSetCooldown = true,
      groups = null,
      subcommands = null,
      isAutocomplete = false,
      autocomplete = null
    }: CommandOptions
  ) {
    this.client = client;
    this.name = name;
    this.description = description;
    this.category = category;
    this.options = options;
    this.defaultPermission = defaultPermission;
    this.permissions = permissions;
    this.development = development;
    this.devOnly = devOnly;
    this.hideCommand = hideCommand;
    this.ownerOnly = ownerOnly;
    this.guildOnly = guildOnly;
    this.perms = perms;
    this.clientPerms = clientPerms;
    this.nsfw = nsfw;
    this.cooldown = cooldown;
    this.globalCooldown = globalCooldown;
    this.canNotDisable = canNotDisable;
    this.canNotSetCooldown = canNotSetCooldown;
    this.ignoreDisabledChannels = ignoreDisabledChannels;
    this.groups = groups;
    this.subcommands = subcommands;
    this.isAutocomplete = isAutocomplete;
    this.autocomplete = autocomplete

    if (options && options.length) this.options = options;
    else if (groups && Object.keys(groups))
      this.options = getSubcommandGroupOptions(groups);
    else if (subcommands && Object.keys(subcommands))
      this.options = getSubcommandOptions(subcommands);
  }

  async setCooldown(interaction: CommandInteraction) {
    const cd = await this.client.utils.getCooldown(this, interaction);

    if (!cd) return;

    let cooldowns;
    if (typeof this.globalCooldown === "undefined" || this.globalCooldown) {
      if (!this.client.globalCooldowns.has(this.name))
        this.client.globalCooldowns.set(this.name, new Collection());
      cooldowns = this.client.globalCooldowns;
    } else {
      if (!this.client.serverCooldowns.has(interaction.guild!.id))
        this.client.serverCooldowns.set(
          interaction.guild!.id,
          new Collection()
        );
      cooldowns = this.client.serverCooldowns.get(interaction.guild!.id);
      if (!cooldowns!.has(this.name))
        cooldowns!.set(this.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns!.get(this.name);
    const cooldownAmount = cd * 1000;

    timestamps!.set(interaction.user.id, now);
    setTimeout(() => timestamps!.delete(interaction.user.id), cooldownAmount);
  }
}

export { Command, CommandOptions };

function getSubcommandGroupOptions(groups: { [x: string]: SubcommandGroup }) {
  const names = Object.keys(groups);
  const options = [];

  for (const name of names) {
    const option: ApplicationCommandOptionData = {
      name,
      description: groups[name].description,
      //@ts-ignore
      options: getSubcommandOptions(groups[name].subcommands),
      type: "SUB_COMMAND_GROUP"
    };

    options.push(option);
  }

  return options;
}

function getSubcommandOptions(subcommands: { [x: string]: Subcommand }) {
  const names = Object.keys(subcommands);
  const options = [];

  for (const name of names) {
    const option: ApplicationCommandOptionData = {
      name,
      description: subcommands[name].description,
      //@ts-ignore
      options: subcommands[name].args,
      type: "SUB_COMMAND"
    };

    options.push(option);
  }

  return options;
}

declare interface SubcommandGroup {
  description: string;
  subcommands: { [x: string]: Subcommand };
}

declare interface Autocomplete {
  execute?({ client, interaction }: { client: Client; interaction: AutocompleteInteraction }): any;
}

declare interface Subcommand {
  description: string;
  isAutocomplete?: boolean;
  autocomplete?({ client, interaction }: { client: Client; interaction: AutocompleteInteraction }): any
  args?: Argument[];
  execute?({
    client,
    interaction,
    group,
    subcommand
  }: {
    client: Client;
    interaction: CommandInteraction;
    group: string;
    subcommand: string;
  }): any;
}

declare interface Argument {
  type:
  | "STRING"
  | "INTEGER"
  | "BOOLEAN"
  | "USER"
  | "CHANNEL"
  | "ROLE"
  | "MENTIONABLE"
  | "NUMBER";
  name: string;
  description: string;
  choices?: Choice[];
  required?: boolean;
  autocomplete?: boolean
}

declare interface Choice {
  name: string;
  value: string | number;
}

declare interface CommandOptions {
  name: string;
  description: string;
  category?: string;
  options?: ApplicationCommandOptionData[];
  defaultPermission?: boolean;
  permissions?: ApplicationCommandPermissionData[];
  development?: boolean;
  devOnly?: boolean;
  hideCommand?: boolean;
  ownerOnly?: boolean;
  guildOnly?: boolean;
  perms?: PermissionString[];
  clientPerms?: PermissionString[];
  nsfw?: boolean;
  cooldown?: number;
  globalCooldown?: boolean;
  canNotDisable?: boolean;
  canNotSetCooldown?: boolean;
  ignoreDisabledChannels?: boolean;
  groups?: { [x: string]: SubcommandGroup } | null;
  subcommands?: { [x: string]: Subcommand } | null;
  isAutocomplete?: boolean;
  autocomplete?: Autocomplete | null
}
