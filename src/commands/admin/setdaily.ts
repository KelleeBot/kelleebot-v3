import { Constants } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { NO_GAMBLING_CHANNEL_SET, GREATER_THAN_ZERO } from "../../../config/messages.json";

export default class Setdaily extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "setdaily",
            category: "Admin",
            description: "Sets the daily rewards amount.",
            perms: ["MANAGE_GUILD"],
            clientPerms: ["SEND_MESSAGES"],
            hideCommand: true,
            options: [
                {
                    name: "amount",
                    description: "The amount to set.",
                    type: Constants.ApplicationCommandOptionTypes.INTEGER,
                    required: true,
                    minValue: 0
                }
            ],
            execute: async ({ client, interaction }) => {
                try {
                    const guildInfo = await client.guildInfo.get(interaction.guildId!);
                    const amount = interaction.options.getInteger("amount")!;
                    if (!guildInfo.gambling.gamblingChannel) return await interaction.reply({ content: NO_GAMBLING_CHANNEL_SET, ephemeral: true });

                    // if (amount < 0) return await interaction.reply({ content: GREATER_THAN_ZERO, ephemeral: true });

                    await client.guildInfo.findByIdAndUpdate(
                        interaction.guildId!,
                        { "gambling.dailyReward": amount },
                        { new: true, upsert: true, setDefaultsOnInsert: true }
                    );

                    return await interaction.reply({
                        content: `Daily reward amount has been successfully set to \`${client.utils.formatNumber(amount)}\`.`,
                        ephemeral: true
                    });
                } catch (e) {
                    client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
                    return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
                }
            }
        });
    }
}
