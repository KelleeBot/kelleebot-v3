import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";

export const reroll = async (client: Client, interaction: CommandInteraction) => {
    const id = interaction.options.getString("id")!;
    // Make sure we are rerolling a giveaway that is within the same guild
    const giveaway = client.giveaways.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === id);
    if (!giveaway) return interaction.reply({ content: "Unable to find a giveaway with the provided ID." });

    try {
        const reroll = await client.giveaways.reroll(id, {
            messages: {
                congrat: "New winner(s): {winners}! Congratulations, you won **{this.prize}**!\n{this.messageURL}",
                error: "No valid participants. No new winner(s) can be chosen!"
            }
        });
        if (!reroll) return interaction.reply({ content: "An error has occurred. Please check the ID and try again.", ephemeral: true });

        return interaction.reply({ content: "Giveaway has successfully been rerolled.", ephemeral: true });
    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
};
