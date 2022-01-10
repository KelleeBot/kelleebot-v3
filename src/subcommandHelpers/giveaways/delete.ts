import { CommandInteraction } from "discord.js";
import { Client } from "../../util/client";

export const deleteGiveaway = async (client: Client, interaction: CommandInteraction) => {
    const id = interaction.options.getString("id")!;
    // Make sure we are deleting a giveaway that is within the same guild
    const giveaway = client.giveaways.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === id);
    if (!giveaway)
        return interaction.reply({ content: "Unable to find a giveaway with the provided ID." });

    try {
        const deleted = await client.giveaways.delete(id);
        if (!deleted)
            return interaction.reply({ content: "An error has occurred. Please check the ID and try again.", ephemeral: true });

        return interaction.reply({ content: "Giveaway has successfully been deleted.", ephemeral: true });

    } catch (e) {
        client.utils.log("ERROR", `${__filename}`, `An error has occurred: ${e}`);
        return interaction.reply({ content: "An error has occurred. Please try again.", ephemeral: true });
    }
};