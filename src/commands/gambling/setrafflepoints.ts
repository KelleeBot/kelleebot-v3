import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";
import { KelleeBotCommand } from "../../util/command";
import { NO_GAMBLING_CHANNEL_SET, GREATER_THAN_ZERO } from "../../../config/messages.json";

export default class Setrafflepoints extends KelleeBotCommand {
    constructor(client: Client) {
        super(client, {
            name: "setrafflepoints",
            category: "Gambling",
            description: "Sets the points to win for raffles.",
            perms: ["MANAGE_GUILD"],
            clientPerms: ["SEND_MESSAGES"],
            hideCommand: true,
            options: [
                {
                    name: "amount",
                    description: "The amount to set.",
                    type: "INTEGER",
                    required: true
                }
            ]
        });
    }
    async execute({ client, interaction }: { client: Client, interaction: CommandInteraction }) {
        try {
            const guildInfo = await client.guildInfo.get(interaction.guildId!);
            const amount = interaction.options.getInteger("amount")!;
            if (!guildInfo.gambling.gamblingChannel)
                return await interaction.reply({ content: NO_GAMBLING_CHANNEL_SET, ephemeral: true });

            if (amount < 0)
                return await interaction.reply({ content: GREATER_THAN_ZERO, ephemeral: true });

            await client.guildInfo.findByIdAndUpdate(
                interaction.guildId!,
                { "gambling.rafflePoints": amount },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );

            return await interaction.reply({
                content: `Raffle points has been successfully set to \`${client.utils.formatNumber(amount)}\`.`,
                ephemeral: true
            });
        } catch (e) {
            client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
            return await interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
        }
    }
}
