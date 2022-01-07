import { AutocompleteInteraction, Snowflake } from "discord.js";
import { KelleeBotUtils } from "../prefab/utils";
import { Client } from "./client";

class Utils extends KelleeBotUtils {
  constructor(client: Client) {
    super(client);
  }

  async getAutocomplete(client: Client, interaction: AutocompleteInteraction, choices: string[]) {
    const focusedValue = interaction.options.getFocused() as string;
    const filtered = choices.filter((choice) => choice.toLowerCase().startsWith(focusedValue.toLowerCase())
    );
    await interaction.respond(
      filtered.slice(0, Math.min(25, filtered.length)).map((choice) => ({
        name: client.utils.titleCase(choice),
        value: client.utils.titleCase(choice)
      }))
    );
  };

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
