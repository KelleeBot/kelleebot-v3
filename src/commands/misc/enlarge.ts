import { CommandInteraction, Util } from "discord.js";
import { Client } from "../../util/client";
import { parse } from "twemoji-parser";
import { KelleeBotCommand } from "../../util/command";

export default class Enlarge extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "enlarge",
            category: "misc",
            description: "Enlarges an emoji.",
            cooldown: 15,
            clientPerms: ["SEND_MESSAGES", "EMBED_LINKS"],
            options: [
                {
                    name: "emoji",
                    description: "The emoji to enlarge",
                    type: "STRING",
                    required: true
                }
            ],
        });
    }
    async execute({ interaction }: { interaction: CommandInteraction }) {
        this.setCooldown(interaction);
        const emoji = interaction.options.getString("emoji")!;
        const custom = Util.parseEmoji(emoji);
        if (custom && custom.id)
            return interaction.reply({
                content: `https://cdn.discordapp.com/emojis/${custom!.id}.${custom!.animated ? "gif" : "png"}`
            });

        const parsed = parse(emoji, { assetType: "png" });
        if (!parsed[0])
            return interaction.reply({ content: "An invalid emoji was provided.", ephemeral: true });

        return interaction.reply({ content: parsed[0].url });
    }
}