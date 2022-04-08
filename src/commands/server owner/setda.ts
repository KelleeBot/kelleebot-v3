import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";

export default class Setda extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "setda",
            category: "Server Owner",
            description: "Server owner sets their ACNH Dream Address.",
            ownerOnly: true,
            options: [
                {
                    name: "address",
                    description: "Your ACNH dreama ddress.",
                    type: Constants.ApplicationCommandOptionTypes.STRING,
                    required: true
                }
            ],
            execute: async ({ client, interaction }) => {
                try {
                    const address = interaction.options.getString("address")!;
                    const regex = address.match(/^DA-\d{4}-\d{4}-\d{4}$/g);
                    if (!regex)
                        return await interaction.reply({
                            content: "Dream Address is of invalid format. Format must be in `DA-1234-1234-1234`.",
                            ephemeral: true
                        });

                    await client.guildInfo.findByIdAndUpdate(
                        interaction.guildId!,
                        { $set: { dreamAddress: address } },
                        { new: true, upsert: true, setDefaultsOnInsert: true }
                    );
                    return await interaction.reply({
                        content: `Your ACNH Dream Address has been successfully set to \`${address}\`.`,
                        ephemeral: true
                    });
                } catch (e) {
                    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
                    return await interaction.reply({ content: "An error has occurred. Please try again." });
                }
            }
        });
    }
}
