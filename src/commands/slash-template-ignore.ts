import { CommandInteraction } from "discord.js";
import { Client } from "../util/client";
import { KelleeBotCommand } from "../util/command";

export default class Template extends KelleeBotCommand {
  constructor(client: Client) {
    super(client, {
      name: "template",
      description: "This is a template"
    });
  }

  async execute({
    client,
    interaction,
    group,
    subcommand
  }: {
    client: Client;
    interaction: CommandInteraction;
    group: string;
    subcommand: string;
  }) {
    //
  }
}
