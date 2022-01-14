import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Setuid extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "setuid",
            category: "Server Owner",
            description: "Server owner sets their Genshin Impact UID.",
            ownerOnly: true,
            options: [
                {
                    name: "uid",
                    description: "Your Genshin Impact UID.",
                    type: "STRING",
                    required: true,
                }
            ]
        });
    }

    async execute({ client, interaction }: { client: Client, interaction: CommandInteraction }) {
        try {
            const uid = interaction.options.getString("uid")!;

            await client.guildInfo.findByIdAndUpdate(
                interaction.guildId!,
                { $set: { genshinUID: uid } },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );
            return await interaction.reply({ content: `Your Genshin UID has been successfully set to \`${uid}\`.`, ephemeral: true });
        } catch (e) {
            client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
            return await interaction.reply({ content: "An error has occurred. Please try again." });
        }
    }
};