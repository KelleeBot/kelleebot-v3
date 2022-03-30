import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Setfc extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "setfc",
            category: "Server Owner",
            description: "Server owner sets their Nintendo Switch friend code.",
            ownerOnly: true,
            options: [
                {
                    name: "code",
                    description: "Your Nintendo Switch friend code.",
                    type: "STRING",
                    required: true,
                }
            ],
            execute: async ({ client, interaction }) => {
                try {
                    const code = interaction.options.getString("code")!;
                    const regex = code.match(/^SW-\d{4}-\d{4}-\d{4}$/g);
                    if (!regex)
                        return await interaction.reply({ content: "Friend code is of invalid format. Format must be in `SW-1234-1234-1234`.", ephemeral: true });

                    await client.guildInfo.findByIdAndUpdate(
                        interaction.guildId!,
                        { $set: { friendCode: code } },
                        { new: true, upsert: true, setDefaultsOnInsert: true }
                    );
                    return await interaction.reply({ content: `Your Nintendo Switch Friend Code has been successfully set to \`${code}\`.`, ephemeral: true });
                } catch (e) {
                    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
                    return await interaction.reply({ content: "An error has occurred. Please try again." });
                }
            }
        });
    }
};