import { Constants, Util } from "discord.js";
import { Client } from "../../util/client";
import { parse } from "twemoji-parser";
import { KelleeBotCommand } from "../../util/command";

export default class Enlarge extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "enlarge",
            category: "Misc",
            description: "Enlarges an emoji.",
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            options: [
                {
                    name: "emoji",
                    description: "The emoji to enlarge",
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: true
                }
            ],
            execute: async ({ interaction }) => {
                this.setCooldown(interaction);
                try {
                    const emoji = interaction.options.getString("emoji")!;
                    const custom = Util.parseEmoji(emoji);
                    if (custom && custom.id)
                        return await interaction.reply({
                            content: `https://cdn.discordapp.com/emojis/${custom!.id}.${custom!.animated ? "gif" : "png"}`
                        });

                    const parsed = parse(emoji, { assetType: "png" });
                    if (!parsed[0]) return await interaction.reply({ content: "An invalid emoji was provided.", ephemeral: true });

                    return await interaction.reply({ content: parsed[0].url });
                } catch (e) {
                    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
                    return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
                }
            }
        });
    }
}
